import { parseArgs } from "@std/cli/parse-args";

import { read_input } from "@lib/input";
import { Area } from "@lib/ui";
import * as vt from "@lib/vt";
import { Alert } from "@ui/alert";
import { Ask } from "@ui/ask";
import { Debug } from "@ui/debug";
import { Editor } from "@ui/editor";
import { Footer } from "@ui/footer";
import { Header } from "@ui/header";
import { Palette, PaletteOption } from "@ui/palette";
import { SaveAs } from "@ui/save-as";

import deno from "../deno.json" with { type: "json" };
import * as cmd from "./commands/mod.ts";
import { editor_graphemes } from "./graphemes.ts";

export class App {
  commands: cmd.Command[] = [
    new cmd.DebugCommand(this),
    new cmd.ExitCommand(this),
    new cmd.PaletteCommand(this),
    new cmd.SaveCommand(this),
    new cmd.WhitespaceCommand(this),
    new cmd.WrapCommand(this),
    new cmd.ZenCommand(this),
  ];

  options: PaletteOption[];

  args = parseArgs(Deno.args);
  zen = true;
  file_path = "";
  changes = false;

  #ed = new Editor(editor_graphemes, { multi_line: true });

  ui = {
    debug: new Debug(),
    editor: this.#ed,
    footer: new Footer(),
    header: new Header(),
    alert: new Alert(this.#ed),
    ask: new Ask(this.#ed),
    save_as: new SaveAs(this.#ed),
    palette: new Palette(this.#ed),
  };

  constructor() {
    this.options = this.commands.filter((x) => x.option).map((x) => ({
      id: x.option!.id,
      description: x.option!.description,
      shortcuts: x.option!.shortcuts ?? "",
    }));

    this.options.sort((a, b) => a.description.localeCompare(b.description));
  }

  async run(): Promise<void> {
    if (this.args.v || this.args.version) {
      console.log(`toy ${deno.version}`);
      Deno.exit();
    }

    this.ui.header.enabled = !this.zen;
    this.ui.footer.enabled = !this.zen;

    this.ui.editor.line_index_enabled = !this.zen;
    this.ui.editor.history.on_changed = (x) => {
      this.changes = x > 0;
      this.ui.header.set_unsaved_flag(x > 0);
    };
    this.ui.editor.on_render = (x) => this.ui.debug.set_render_time(x);
    this.ui.editor.on_cursor = (x) => this.ui.footer.set_cursor_status(x);
    this.ui.editor.enabled = true;

    vt.init();
    globalThis.addEventListener("unload", this.stop);
    Deno.addSignalListener("SIGWINCH", this.#on_sigwinch);

    this.resize();
    this.render();

    await this.#load();

    await this.#process_input();
  }

  stop = () => {
    vt.restore();

    Deno.exit(0);
  };

  resize(): void {
    const { palette, editor, debug, header, footer, save_as, alert, ask } =
      this.ui;

    const screen = Area.from_screen();

    if (this.zen) {
      editor.resize(screen);
      debug.resize(screen);
    } else {
      const [header_area, a0] = screen.div_y(1);
      header.resize(header_area);

      const [editor_area, footer_area] = a0.div_y(-1);
      editor.resize(editor_area);
      debug.resize(editor_area);

      footer.resize(footer_area);
    }

    save_as.resize(screen);
    alert.resize(screen);
    ask.resize(screen);
    palette.resize(screen);
  }

  render(): void {
    const { palette, editor, debug, header, footer, save_as, alert, ask } =
      this.ui;

    vt.begin_sync_write();

    header.render();
    editor.render();
    footer.render();
    debug.render();
    save_as.render();
    alert.render();
    ask.render();
    palette.render();

    vt.end_sync_write();
  }

  async save(): Promise<void> {
    const { editor, alert } = this.ui;

    if (!this.file_path) {
      await this.#save_as();
      return;
    }

    try {
      using file = await Deno.open(this.file_path, {
        create: true,
        write: true,
        truncate: true,
      });

      await editor.buffer.save(file);
    } catch (err) {
      await alert.open(err);

      await this.#save_as();
    }
  }

  async #load(): Promise<void> {
    const path = this.args._[0];
    if (typeof path !== "string") {
      return;
    }

    const { editor, alert } = this.ui;

    try {
      using file = await Deno.open(path, { read: true });

      const info = await file.stat();
      if (!info.isFile) {
        throw new Error(`${path} is not a file`);
      }

      await editor.buffer.load(file);

      editor.reset(true);
      editor.render();

      this.#set_file_path(path);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        this.#set_file_path(path);
      } else {
        await alert.open(err);

        this.stop();
      }
    }
  }

  async #save_as(): Promise<void> {
    const { save_as, editor, alert } = this.ui;

    while (true) {
      const path = await save_as.open(this.file_path);
      if (!path) {
        return;
      }

      try {
        using file = await Deno.open(path, {
          create: true,
          write: true,
          truncate: true,
        });

        await editor.buffer.save(file);

        this.#set_file_path(path);

        return;
      } catch (err) {
        await alert.open(err);
      }
    }
  }

  #on_sigwinch = () => {
    this.resize();

    vt.direct_write(vt.dummy_req);
  };

  async #process_input(): Promise<void> {
    while (true) {
      for await (const data of read_input()) {
        if (data instanceof Uint8Array) {
          this.render();
          continue;
        }

        if (typeof data !== "string") {
          const command = this.commands.find((x) => x.match(data));
          if (command && !cmd.Command.running) {
            await command.run(data);
            continue;
          }
        }

        if (this.ui.editor.enabled) {
          if (this.ui.editor.handle_key(data)) {
            this.ui.editor.render();
          }
        }
      }
    }
  }

  #set_file_path(x: string): void {
    this.file_path = x;

    this.ui.header.set_file_path(x);
  }
}

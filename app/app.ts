import { parseArgs } from "@std/cli/parse-args";

import { Area, Control } from "@lib/ui";
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

export class App extends Control {
  commands: cmd.Command[] = [
    new cmd.CopyCommand(this),
    new cmd.CutCommand(this),
    new cmd.DebugCommand(this),
    new cmd.ExitCommand(this),
    new cmd.PaletteCommand(this),
    new cmd.PasteCommand(this),
    new cmd.RedoCommand(this),
    new cmd.SaveCommand(this),
    new cmd.SelectAllCommand(this),
    new cmd.UndoCommand(this),
    new cmd.WhitespaceCommand(this),
    new cmd.WrapCommand(this),
    new cmd.ZenCommand(this),
  ];

  options: PaletteOption[];

  args = parseArgs(Deno.args);
  zen_enabled = true;
  file_path = "";
  changes = false;

  ui = {
    debug: new Debug(this),
    editor: new Editor(this, editor_graphemes, { multi_line: true }),
    footer: new Footer(this),
    header: new Header(this),
    alert: new Alert(this),
    ask: new Ask(this),
    save_as: new SaveAs(this),
    palette: new Palette(this),
  };

  constructor() {
    super();

    this.options = this.commands.filter((x) => x.option).map((x) => x.option!);
    this.options.sort((a, b) => a.description.localeCompare(b.description));
  }

  async run(): Promise<void> {
    if (this.args.v || this.args.version) {
      console.log(`toy ${deno.version}`);
      Deno.exit();
    }

    const { editor, debug, header, footer } = this.ui;

    editor.enabled = true;
    editor.on_input_handled = (x) => debug.set_input_time(x);
    editor.on_render = (x) => debug.set_render_time(x);
    editor.on_cursor = (x) => footer.set_cursor_status(x);
    editor.history.on_changed = (x) => {
      this.changes = x > 0;
      header.set_unsaved_flag(x > 0);
    };

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.stop);
    Deno.addSignalListener("SIGWINCH", this.#on_sigwinch);

    this.enable_zen(true);

    await this.#load();

    await this.#process_input();
  }

  stop = (e?: PromiseRejectionEvent) => {
    vt.restore();

    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  };

  override resize(screen: Area): void {
    const { palette, editor, debug, header, footer, save_as, alert, ask } =
      this.ui;

    if (this.zen_enabled) {
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
    vt.bsu();

    this.ui.header.render();
    this.ui.editor.render();
    this.ui.footer.render();
    this.ui.debug.render();
    this.ui.save_as.render();
    this.ui.alert.render();
    this.ui.ask.render();
    this.ui.palette.render();

    vt.esu();
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

  enable_zen(enabled: boolean): void {
    const { header, footer, editor } = this.ui;

    this.zen_enabled = enabled;

    header.enabled = !enabled;
    footer.enabled = !enabled;
    editor.line_index_enabled = !enabled;

    this.resize(Area.from_screen());
    this.render();
  }

  #on_sigwinch = () => {
    this.resize(Area.from_screen());

    vt.dummy_req();
  };

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

  #set_file_path(x: string): void {
    this.file_path = x;

    this.ui.header.set_file_path(x);
  }

  async #process_input(): Promise<void> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.render();
          continue;
        }

        if (typeof key !== "string") {
          const command = this.commands.find((x) => x.match(key));
          if (command && !cmd.Command.running) {
            await command.run(key);
            continue;
          }
        }

        if (this.ui.editor.enabled) {
          if (this.ui.editor.handle_input(key)) {
            this.ui.editor.render();
          }
        }
      }
    }
  }
}

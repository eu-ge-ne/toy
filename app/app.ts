import { parseArgs } from "@std/cli/parse-args";

import { display_keys, Key, read_input } from "@lib/input";
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
import { Command } from "./commands/command.ts";

export class App {
  commands: cmd.Command[] = [
    new cmd.TextCommand(this),
    new cmd.BackspaceCommand(this),
    new cmd.BottomCommand(this),
    new cmd.CopyCommand(this),
    new cmd.CutCommand(this),
    new cmd.DebugCommand(this),
    new cmd.DeleteCommand(this),
    new cmd.DownCommand(this),
    new cmd.EndCommand(this),
    new cmd.EnterCommand(this),
    new cmd.EscCommand(this),
    new cmd.ExitCommand(this),
    new cmd.HomeCommand(this),
    new cmd.InvisibleCommand(this),
    new cmd.LeftCommand(this),
    new cmd.PageDownCommand(this),
    new cmd.PageUpCommand(this),
    new cmd.PaletteCommand(this),
    new cmd.PasteCommand(this),
    new cmd.RedoCommand(this),
    new cmd.RightCommand(this),
    new cmd.SaveCommand(this),
    new cmd.SelectAllCommand(this),
    new cmd.TabCommand(this),
    new cmd.TopCommand(this),
    new cmd.UndoCommand(this),
    new cmd.UpCommand(this),
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
      name: x.option!.name,
      description: x.option!.description,
      keys: display_keys(x.keys),
    }));

    this.options.sort((a, b) => a.name.localeCompare(b.name));
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

    for await (const data of read_input()) {
      await this.#on_input(data);
    }
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

    header.render();
    editor.render();
    footer.render();
    debug.render();
    save_as.render();
    alert.render();
    ask.render();
    palette.render();
  }

  get active_editor(): Editor | undefined {
    const { palette, save_as, editor } = this.ui;

    if (palette.enabled) {
      return palette.editor;
    }

    if (save_as.enabled) {
      return save_as.editor;
    }

    if (editor.enabled) {
      return editor;
    }

    return undefined;
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

    vt.write(vt.dummy_req);
  };

  async #on_input(key: Key | string | Uint8Array): Promise<void> {
    if (key instanceof Uint8Array) {
      this.render();
      return;
    }

    this.#run_command(key, this.commands.find((x) => x.match(key)));
  }

  async #run_command(key: Key | string, command?: Command): Promise<void> {
    while (command) {
      command = await command.run(key);
    }
  }

  #set_file_path(x: string): void {
    this.file_path = x;

    this.ui.header.set_file_path(x);
  }
}

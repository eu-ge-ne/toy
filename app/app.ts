import { parseArgs } from "@std/cli/parse-args";

import { Key, read_input } from "@lib/input";
import { Area } from "@lib/ui";
import * as vt from "@lib/vt";
import { Alert } from "@ui/alert";
import { Ask } from "@ui/ask";
import { Debug } from "@ui/debug";
import { Editor } from "@ui/editor";
import { Footer } from "@ui/footer";
import { Header } from "@ui/header";
import { SaveAs } from "@ui/save-as";

import deno from "../deno.json" with { type: "json" };
import * as act from "./action/mod.ts";
import { editor_graphemes } from "./graphemes.ts";

export class App {
  #actions = [
    new act.TextAction(this),
    new act.BackspaceAction(this),
    new act.BottomAction(this),
    new act.CopyAction(this),
    new act.CutAction(this),
    new act.DeleteAction(this),
    new act.DownAction(this),
    new act.EndAction(this),
    new act.EnterAction(this),
    new act.EscAction(this),
    new act.HomeAction(this),
    new act.LeftAction(this),
    new act.PageDownAction(this),
    new act.PageUpAction(this),
    new act.PasteAction(this),
    new act.RedoAction(this),
    new act.RightAction(this),
    new act.SelectAllAction(this),
    new act.TabAction(this),
    new act.TopAction(this),
    new act.UndoAction(this),
    new act.UpAction(this),

    new act.DebugAction(this),
    new act.ExitAction(this),
    new act.InvisibleAction(this),
    new act.SaveAction(this),
    new act.WrapAction(this),
    new act.ZenAction(this),
  ];

  args = parseArgs(Deno.args);

  zen = true;
  file_path = "";
  changes = false;

  ui = {
    alert: new Alert(),
    ask: new Ask(),
    debug: new Debug(),
    editor: new Editor(editor_graphemes, { multi_line: true }),
    footer: new Footer(),
    header: new Header(),
    save_as: new SaveAs(),
  };

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

    await new act.LoadAction(this).run();

    for await (const data of read_input()) {
      await this.#on_input(data);
    }
  }

  stop = () => {
    vt.restore();

    Deno.exit(0);
  };

  resize(): void {
    const { editor, debug, header, footer, save_as, alert, ask } = this.ui;

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
  }

  render(): void {
    const { editor, debug, header, footer, save_as, alert, ask } = this.ui;

    header.render();
    editor.render();
    footer.render();
    debug.render();
    save_as.render();
    alert.render();
    ask.render();
  }

  set_file_path(x: string): void {
    this.file_path = x;

    this.ui.header.set_file_path(x);
  }

  get focused_editor(): Editor | undefined {
    if (this.ui.save_as.enabled) {
      return this.ui.save_as.editor;
    }

    if (this.ui.editor.enabled) {
      return this.ui.editor;
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

        this.set_file_path(path);

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

    this.#actions.find((x) => x.match(key))?.run(key);
  }
}

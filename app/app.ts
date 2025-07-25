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
import { DebugAction } from "./debug.ts";
import { exit, ExitAction } from "./exit.ts";
import { editor_graphemes } from "./graphemes.ts";
import { InvisibleAction } from "./invisible.ts";
import { LoadAction } from "./load.ts";
import { SaveAsAction } from "./save-as.ts";
import { SaveAction } from "./save.ts";
import { WrapAction } from "./wrap.ts";
import { ZenAction } from "./zen.ts";

export class App {
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

  action = {
    exit: new ExitAction(this),
    debug: new DebugAction(this),
    save_as: new SaveAsAction(this),
    save: new SaveAction(this),
    wrap: new WrapAction(this),
    invisible: new InvisibleAction(this),
    zen: new ZenAction(this),
  };

  actions_started = 0;

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
    this.ui.editor.on_react = (x) => this.ui.debug.set_react_time(x);
    this.ui.editor.on_render = (x) => this.ui.debug.set_editor_render_time(x);
    this.ui.editor.on_cursor = (x) => this.ui.footer.set_cursor_status(x);
    this.ui.editor.enabled = true;

    vt.init();
    globalThis.addEventListener("unload", exit);
    Deno.addSignalListener("SIGWINCH", this.#on_sigwinch);

    this.resize();
    this.render();

    await new LoadAction(this).run();

    for await (const data of read_input()) {
      await this.#on_input(data);
    }
  }

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

  #on_sigwinch = () => {
    this.resize();

    vt.write(vt.dummy_req);
  };

  async #on_input(key: Key | string | Uint8Array): Promise<void> {
    if (key instanceof Uint8Array) {
      this.render();
      return;
    }

    const { ui, action, actions_started } = this;

    if (ui.alert.enabled) {
      ui.alert.on_key(key);
      return;
    }

    if (ui.ask.enabled) {
      ui.ask.on_key(key);
      return;
    }

    if (ui.save_as.enabled) {
      ui.save_as.on_key(key);
      return;
    }

    if (actions_started > 0) {
      return;
    }

    if (typeof key !== "string") {
      switch (key.name) {
        case "F2":
          action.save.run();
          return;
        case "F5":
          action.invisible.run();
          return;
        case "F6":
          action.wrap.run();
          return;
        case "F9":
          action.debug.run();
          return;
        case "F10":
          action.exit.run();
          return;
        case "F11":
          action.zen.run();
          return;
      }
    }

    if (ui.editor.enabled) {
      ui.editor.on_key(key);
    }
  }
}

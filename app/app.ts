import { parseArgs } from "@std/cli/parse-args";

import { Key, read_input } from "@lib/input";
import { Area } from "@lib/ui";
import * as vt from "@lib/vt";
import { Alert } from "@ui/alert";
import { Ask } from "@ui/ask";
import { Debug, DebugArea } from "@ui/debug";
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
  unsaved_changes = false;

  editor = new Editor(editor_graphemes, { multi_line: true });
  header = new Header();
  footer = new Footer();
  save_as = new SaveAs();
  debug = new Debug();
  alert = new Alert();
  ask = new Ask();

  action_running = false;
  action = {
    exit: new ExitAction(this),
    debug: new DebugAction(this),
    save_as: new SaveAsAction(this),
    save: new SaveAction(this),
    wrap: new WrapAction(this),
    invisible: new InvisibleAction(this),
    zen: new ZenAction(this),
  };

  async run(): Promise<void> {
    if (this.args.v || this.args.version) {
      console.log(`toy ${deno.version}`);
      Deno.exit();
    }

    vt.init();
    globalThis.addEventListener("unload", exit);

    this.header.enabled = !this.zen;
    this.footer.enabled = !this.zen;
    this.editor.line_index_enabled = !this.zen;

    this.editor.enabled = true;
    this.editor.on_has_changes = (x) => {
      this.unsaved_changes = x;
      this.header.set_unsaved_flag(x);
    };
    this.editor.on_react = (x) => this.debug.set_react_time(x);
    this.editor.on_render = (x) => this.debug.set_editor_render_time(x);
    this.editor.on_cursor = (x) => this.footer.set_cursor_status(x);

    Deno.addSignalListener("SIGWINCH", this.#on_sigwinch);

    this.resize();
    this.render();

    await new LoadAction(this).run();

    for await (const data of read_input()) {
      await this.#on_input(data);
    }
  }

  resize(): void {
    const screen = Area.from_screen();

    if (this.zen) {
      this.editor.resize(screen);
      this.debug.resize(screen.right_bottom(DebugArea));
    } else {
      const [header_area, a0] = screen.div_y(1);
      this.header.resize(header_area);

      const [editor_area, footer_area] = a0.div_y(-1);
      this.editor.resize(editor_area);
      this.debug.resize(editor_area.right_bottom(DebugArea));

      this.footer.resize(footer_area);
    }

    this.save_as.resize(screen);
    this.alert.resize(screen);
    this.ask.resize(screen);
  }

  render(): void {
    this.header.render();
    this.editor.render();
    this.footer.render();
    this.debug.render();
    this.save_as.render();
    this.alert.render();
    this.ask.render();
  }

  set_file_path(x: string): void {
    this.file_path = x;

    this.header.set_file_path(x);
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

    const { action, action_running, editor } = this;

    if (this.alert.enabled) {
      this.alert.on_key(key);
      return;
    }

    if (this.ask.enabled) {
      this.ask.on_key(key);
      return;
    }

    if (this.save_as.enabled) {
      this.save_as.on_key(key);
      return;
    }

    if (action_running) {
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

    if (editor.enabled) {
      editor.on_key(key);
    }
  }
}

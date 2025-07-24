import { parseArgs } from "@std/cli/parse-args";

import { InputReader, Key, new_input_reader } from "@lib/input";
import { Area } from "@lib/ui";
import { init_vt } from "@lib/vt";
import { Alert } from "@ui/alert";
import { Ask } from "@ui/ask";
import { Debug, DebugArea } from "@ui/debug";
import { Editor } from "@ui/editor";
import { Footer } from "@ui/footer";
import { Header } from "@ui/header";
import { SaveAs } from "@ui/save-as";

import deno from "../deno.json" with { type: "json" };
import { Action } from "./action.ts";
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
  #input?: InputReader;

  zen = true;
  file_path = "";
  unsaved_changes = true;

  editor = new Editor(editor_graphemes, { multi_line: true });
  header = new Header();
  footer = new Footer();
  save_as = new SaveAs();
  debug = new Debug();
  alert = new Alert();
  ask = new Ask();

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
    const args = parseArgs(Deno.args);

    if (args.v || args.version) {
      console.log(`toy ${deno.version}`);
      Deno.exit();
    }

    init_vt();
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

    Deno.addSignalListener("SIGWINCH", this.#refresh);
    this.#refresh();

    await this.#act(new LoadAction(this), args._[0]);
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

  #refresh = () => {
    this.resize();
    this.render();
  };

  // deno-lint-ignore no-explicit-any
  async #act<P extends any[]>(act: Action<P>, ...p: P): Promise<void> {
    const started = Date.now();

    try {
      this.#input?.releaseLock();
      this.editor.enabled = false;

      await act.run(...p);
    } finally {
      this.#input = new_input_reader(this.#on_key);
      this.editor.enabled = true;

      this.render();

      this.debug.set_react_time(Date.now() - started);
    }
  }

  set_file_path(x: string): void {
    this.file_path = x;

    this.header.set_file_path(x);
  }

  toggle_zen(): void {
    this.zen = !this.zen;

    this.header.enabled = !this.zen;
    this.footer.enabled = !this.zen;
    this.editor.line_index_enabled = !this.zen;
  }

  #on_key = async (key: Key | string) => {
    if (typeof key !== "string") {
      switch (key.name) {
        case "F2":
          await this.#act(this.action.save);
          return;
        case "F5":
          await this.#act(this.action.invisible);
          return;
        case "F6":
          await this.#act(this.action.wrap);
          return;
        case "F9":
          await this.#act(this.action.debug);
          return;
        case "F10":
          await this.#act(this.action.exit);
          return;
        case "F11":
          await this.#act(this.action.zen);
          return;
      }
    }

    this.editor.on_key(key);
  };
}

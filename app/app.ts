import { parseArgs } from "@std/cli/parse-args";

import { Key, read_input } from "@lib/input";
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

export class App {
  file_path = "";
  unsaved_changes = true;

  editor = new Editor(editor_graphemes, {
    multi_line: true,
    show_ln_index: true,
  });

  header = new Header();
  footer = new Footer();
  save_as = new SaveAs();
  debug = new Debug();
  alert = new Alert();
  ask = new Ask();

  on_input_key_busy = false;

  action = {
    exit: new ExitAction(this),
    debug: new DebugAction(this),
    save_as: new SaveAsAction(this),
    save: new SaveAction(this),
    wrap: new WrapAction(this),
    invisible: new InvisibleAction(this),
  };

  async run(): Promise<void> {
    const args = parseArgs(Deno.args);

    if (args.v || args.version) {
      console.log(`toy ${deno.version}`);
      Deno.exit();
    }

    init_vt();
    globalThis.addEventListener("unload", exit);

    this.editor.enabled = true;
    this.header.enabled = true;
    this.footer.enabled = true;

    this.editor.on_has_changes = (x) => {
      this.unsaved_changes = x;
      this.header.set_unsaved_flag(x);
    };
    this.editor.on_react = (x) => this.debug.set_react_time(x);
    this.editor.on_render = (x) => this.debug.set_editor_render_time(x);
    this.editor.on_cursor = (x) => this.footer.set_cursor_status(x);

    Deno.addSignalListener("SIGWINCH", this.#refresh);
    this.#refresh();

    if (typeof args._[0] === "string") {
      await this.#act(new LoadAction(this), args._[0]);
    }

    while (true) {
      for await (const key of read_input()) {
        await this.#handle_key(key);
      }
    }
  }

  resize(): void {
    const screen = Area.from_screen();

    const [header_area, a0] = screen.div_y(1);
    this.header.resize(header_area);

    const [editor_area, footer_area] = a0.div_y(-1);
    this.editor.resize(editor_area);
    this.footer.resize(footer_area);

    this.debug.resize(editor_area.right_bottom(DebugArea));
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

  async #handle_key(key: Key | string): Promise<void> {
    if (this.on_input_key_busy) {
      return;
    }

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
      }
    }

    this.editor.on_key(key);
  }

  // deno-lint-ignore no-explicit-any
  async #act<P extends any[]>(act: Action<P>, ...p: P): Promise<void> {
    const started = Date.now();

    try {
      this.on_input_key_busy = true;
      this.editor.enabled = false;

      await act.run(...p);
    } finally {
      this.on_input_key_busy = false;
      this.editor.enabled = true;

      this.render();

      this.debug.set_react_time(Date.now() - started);
    }
  }

  set_file_path(x: string): void {
    this.file_path = x;

    this.header.set_file_path(x);
  }
}

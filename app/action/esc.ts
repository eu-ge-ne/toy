import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class EscAction extends Action {
  match(key: Key | string): boolean {
    return typeof key !== "string" && key.name === "ESC";
  }

  protected override async _run(): Promise<void> {
    const { alert, ask, save_as, editor } = this.app.ui;

    if (alert.enabled) {
      alert.on_esc_key();
      alert.render();
      return;
    }

    if (ask.enabled) {
      ask.on_esc_key();
      ask.render();
      return;
    }

    if (save_as.enabled) {
      save_as.on_esc_key();
      save_as.render();
      return;
    }

    if (editor.enabled) {
      editor.on_esc_key();
      editor.render();
    }
  }
}

import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class EnterAction extends Action {
  match(key: Key | string): boolean {
    return typeof key !== "string" && key.name === "ENTER";
  }

  protected override async _run(): Promise<void> {
    const { alert, ask, save_as, editor } = this.app.ui;

    if (alert.enabled) {
      alert.on_enter_key();
      alert.render();
      return;
    }

    if (ask.enabled) {
      ask.on_enter_key();
      ask.render();
      return;
    }

    if (save_as.enabled) {
      save_as.on_enter_key();
      save_as.render();
      return;
    }

    if (editor.enabled) {
      editor.on_enter_key();
      editor.render();
    }
  }
}

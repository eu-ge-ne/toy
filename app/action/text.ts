import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class TextAction extends Action {
  match(key: Key | string): boolean {
    return typeof key === "string" || typeof key.text === "string";
  }

  protected override async _run(key: Key | string): Promise<void> {
    const { alert, ask, save_as, editor } = this.app.ui;

    if (alert.enabled) {
      return;
    }

    if (ask.enabled) {
      return;
    }

    const text = typeof key === "string" ? key : key.text!;

    if (save_as.enabled) {
      save_as.editor.insert(text);
      save_as.editor.render();
      return;
    }

    editor.insert(text);
    editor.render();
  }
}

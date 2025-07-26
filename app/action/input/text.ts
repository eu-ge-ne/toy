import { Key } from "@lib/input";

import { Action } from "../action.ts";

export class TextAction extends Action {
  keys = [];

  override match(key: Key | string): boolean {
    return typeof key === "string" || typeof key.text === "string";
  }

  protected override async _run(key: Key | string): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    const text = typeof key === "string" ? key : key.text!;

    editor.insert(text);

    editor.render();
  }
}

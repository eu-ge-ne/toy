import { Key } from "@lib/input";

import { Action } from "../action.ts";

export class HomeAction extends Action {
  keys = [
    { name: "HOME" },
    { name: "LEFT", super: true },

    { name: "HOME", shift: true },
    { name: "LEFT", super: true, shift: true },
  ];

  protected override async _run(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor } = editor;

    const select = Boolean(key.shift);

    cursor.move(0, -Number.MAX_SAFE_INTEGER, select);

    editor.render();
  }
}

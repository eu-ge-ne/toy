import { Key } from "@lib/input";

import { Action } from "../action.ts";

export class LeftAction extends Action {
  keys = [
    { name: "LEFT" },
    { name: "LEFT", shift: true },
  ];

  protected override async action(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor } = editor;

    const select = Boolean(key.shift);

    if (!cursor.move(0, -1, select) && cursor.ln > 0) {
      cursor.move(-1, Number.MAX_SAFE_INTEGER, select);
    }

    editor.render();
  }
}

import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class EndAction extends Action {
  keys = [
    { name: "END" },
    { name: "RIGHT", super: true },

    { name: "END", shift: true },
    { name: "RIGHT", super: true, shift: true },
  ];

  protected override async action(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.cursor.move(0, Number.MAX_SAFE_INTEGER, Boolean(key.shift));

    editor.render();
  }
}

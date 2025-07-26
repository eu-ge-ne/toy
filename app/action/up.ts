import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class UpAction extends Action {
  keys = [
    { name: "UP" },
    { name: "UP", shift: true },
  ];

  protected override async action(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    editor.cursor.move(-1, 0, Boolean(key.shift));

    editor.render();
  }
}

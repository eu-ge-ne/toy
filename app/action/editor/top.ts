import { Key } from "@lib/input";

import { Action } from "../action.ts";

export class TopAction extends Action {
  keys = [
    { name: "UP", super: true },
    { name: "UP", super: true, shift: true },
  ];

  protected override async action(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    const { cursor } = editor;

    const select = Boolean(key.shift);

    cursor.move(-Number.MAX_SAFE_INTEGER, 0, select);

    editor.render();
  }
}

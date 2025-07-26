import { Key } from "@lib/input";

import { Action } from "../action.ts";

export class DownAction extends Action {
  keys = [
    { name: "DOWN" },
    { name: "DOWN", shift: true },
  ];

  protected override async _run(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    const { cursor } = editor;

    const select = Boolean(key.shift);

    cursor.move(1, 0, select);

    editor.render();
  }
}

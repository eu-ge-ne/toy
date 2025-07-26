import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class PageDownAction extends Action {
  keys = [
    { name: "PAGE_DOWN" },
    { name: "PAGE_DOWN", shift: true },
  ];

  protected override async action(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    editor.cursor.move(editor.area.h, 0, Boolean(key.shift));

    editor.render();
  }
}

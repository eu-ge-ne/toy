import { copy_to_clipboard, write } from "@lib/vt";

import { Action } from "../action.ts";

export class CopyAction extends Action {
  keys = [
    { name: "c", ctrl: true },
    { name: "c", super: true },
  ];

  protected override async _run(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor, buffer } = editor;

    if (cursor.selecting) {
      editor.clipboard = buffer.copy(cursor.from, cursor.to);

      cursor.set(cursor.ln, cursor.col, false);
    } else {
      editor.clipboard = buffer.copy([cursor.ln, cursor.col], [
        cursor.ln,
        cursor.col,
      ]);
    }

    write(copy_to_clipboard(editor.clipboard));
  }
}

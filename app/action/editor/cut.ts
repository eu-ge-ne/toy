import { copy_to_clipboard, write } from "@lib/vt";

import { Action } from "../action.ts";

export class CutAction extends Action {
  keys = [
    { name: "x", ctrl: true },
    { name: "x", super: true },
  ];

  protected override async _run(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor, buffer } = editor;

    if (cursor.selecting) {
      editor.clipboard = buffer.copy(cursor.from, cursor.to);

      editor.delete_selection();
    } else {
      editor.clipboard = buffer.copy([cursor.ln, cursor.col], [
        cursor.ln,
        cursor.col,
      ]);

      editor.delete_char();
    }

    write(copy_to_clipboard(editor.clipboard));

    editor.render();
  }
}

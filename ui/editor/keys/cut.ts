import { copy_to_clipboard, write_direct } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class CutHandler extends KeyHandler {
  keys = [
    { name: "x", ctrl: true },
    { name: "x", super: true },
  ];

  handle(): boolean {
    const { cursor, buffer } = this.editor;

    if (cursor.selecting) {
      this.editor.clipboard = buffer.copy(cursor.from, cursor.to);

      this.editor.delete_selection();
    } else {
      this.editor.clipboard = buffer.copy([cursor.ln, cursor.col], [
        cursor.ln,
        cursor.col,
      ]);

      this.editor.delete_char();
    }

    write_direct(copy_to_clipboard(this.editor.clipboard));

    return true;
  }
}

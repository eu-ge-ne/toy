import { copy_to_clipboard, direct_write } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class CopyHandler extends KeyHandler {
  keys = [
    { name: "c", ctrl: true },
    { name: "c", super: true },
  ];

  handle(): void {
    const { cursor, buffer } = this.editor;

    if (cursor.selecting) {
      this.editor.clipboard = buffer.copy(cursor.from, cursor.to);

      cursor.set(cursor.ln, cursor.col, false);
    } else {
      this.editor.clipboard = buffer.copy([cursor.ln, cursor.col], [
        cursor.ln,
        cursor.col,
      ]);
    }

    direct_write(copy_to_clipboard(this.editor.clipboard));
  }
}

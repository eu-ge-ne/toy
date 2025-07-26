import { copy_to_clipboard, write } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class Cut extends KeyHandler {
  keys = [
    { name: "x", ctrl: true },
    { name: "x", super: true },
  ];

  handle(): void {
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

    write(copy_to_clipboard(this.editor.clipboard));
  }
}

export class Paste extends KeyHandler {
  keys = [
    { name: "v", ctrl: true },
    { name: "v", super: true },
  ];

  handle(): void {
    const { clipboard } = this.editor;

    if (clipboard.length > 0) {
      this.editor.insert(clipboard);
    }
  }
}

import { copy_to_clipboard, flush } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class Copy extends KeyHandler {
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

    flush(copy_to_clipboard(this.editor.clipboard));
  }
}

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

    flush(copy_to_clipboard(this.editor.clipboard));
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

import { copy_to_clipboard } from "@lib/vt";

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
      this.editor.clipboard = buffer.copy(cursor, cursor);

      this.editor.delete_char();
    }

    copy_to_clipboard(this.editor.clipboard);

    return true;
  }
}

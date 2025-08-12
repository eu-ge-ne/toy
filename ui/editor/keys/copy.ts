import { copy_to_clipboard } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class CopyHandler extends KeyHandler {
  keys = [
    { name: "c", ctrl: true },
    { name: "c", super: true },
  ];

  handle(): boolean {
    const { cursor, buffer } = this.editor;

    if (cursor.selecting) {
      this.editor.clipboard = buffer.seg_read(cursor.from, cursor.to);

      cursor.set(cursor.ln, cursor.col, false);
    } else {
      this.editor.clipboard = buffer.seg_read(cursor, cursor);
    }

    copy_to_clipboard(this.editor.clipboard);

    return false;
  }
}

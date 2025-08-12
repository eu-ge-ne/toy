import { iter_to_str } from "@lib/std";
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
      const text = iter_to_str(buffer.seg_read(cursor.from, cursor.to));
      this.editor.clipboard = text;

      this.editor.delete_selection();
    } else {
      this.editor.clipboard = iter_to_str(buffer.seg_read(cursor, cursor));

      this.editor.delete_char();
    }

    copy_to_clipboard(this.editor.clipboard);

    return true;
  }
}

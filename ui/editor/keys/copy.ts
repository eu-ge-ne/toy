import { iter_to_str } from "@lib/std";
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
      this.editor.clipboard = iter_to_str(
        buffer.seg_read(cursor.from, {
          ln: cursor.to.ln,
          col: cursor.to.col + 1,
        }),
      );

      cursor.set(cursor.ln, cursor.col, false);
    } else {
      this.editor.clipboard = iter_to_str(
        buffer.seg_read(cursor, { ln: cursor.ln, col: cursor.col + 1 }),
      );
    }

    copy_to_clipboard(this.editor.clipboard);

    return false;
  }
}

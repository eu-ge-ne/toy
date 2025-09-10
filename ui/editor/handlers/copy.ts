import { iter_to_str } from "@lib/std";
import { copy_to_clipboard, Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class CopyHandler extends EditorHandler {
  keys = [
    Key.create({ name: "c", ctrl: true }),
    Key.create({ name: "c", super: true }),
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

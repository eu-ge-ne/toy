import * as vt from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class CopyHandler extends EditorHandler {
  keys = [
    vt.Key.create({ name: "c", ctrl: true }),
    vt.Key.create({ name: "c", super: true }),
  ];

  handle(): boolean {
    const { cursor, buffer } = this.editor;

    if (cursor.selecting) {
      this.editor.clipboard = buffer.read(cursor.from, {
        ln: cursor.to.ln,
        col: cursor.to.col + 1,
      });

      cursor.set(cursor.ln, cursor.col, false);
    } else {
      this.editor.clipboard = buffer.read(cursor, {
        ln: cursor.ln,
        col: cursor.col + 1,
      });
    }

    vt.copy_to_clipboard(vt.sync, this.editor.clipboard);

    return false;
  }
}

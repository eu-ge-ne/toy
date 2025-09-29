import { copy_to_clipboard, Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class CutHandler extends EditorHandler {
  keys = [
    Key.create({ name: "x", ctrl: true }),
    Key.create({ name: "x", super: true }),
  ];

  handle(): boolean {
    const { cursor, buffer } = this.editor;

    if (cursor.selecting) {
      this.editor.clipboard = buffer.read(cursor.from, {
        ln: cursor.to.ln,
        col: cursor.to.col + 1,
      });

      this.editor.delete_selection();
    } else {
      this.editor.clipboard = buffer.read(cursor, {
        ln: cursor.ln,
        col: cursor.col + 1,
      });

      this.editor.delete_char();
    }

    copy_to_clipboard(this.editor.clipboard);

    return true;
  }
}

import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class BottomHandler extends EditorHandler {
  keys = [
    Key.create({ name: "DOWN", super: true }),
    Key.create({ name: "DOWN", super: true, shift: true }),
  ];

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.bottom(key.shift);
  }
}

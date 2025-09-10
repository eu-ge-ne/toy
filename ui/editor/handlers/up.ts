import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class UpHandler extends EditorHandler {
  keys = [
    Key.create({ name: "UP" }),
    Key.create({ name: "UP", shift: true }),
  ];

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.up(1, key.shift);
  }
}

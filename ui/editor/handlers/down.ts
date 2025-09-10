import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class DownHandler extends EditorHandler {
  keys = [
    Key.create({ name: "DOWN" }),
    Key.create({ name: "DOWN", shift: true }),
  ];

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.down(1, key.shift);
  }
}

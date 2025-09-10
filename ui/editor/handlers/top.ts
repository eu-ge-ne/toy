import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class TopHandler extends EditorHandler {
  keys = [
    Key.create({ name: "UP", super: true }),
    Key.create({ name: "UP", super: true, shift: true }),
  ];

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.top(key.shift);
  }
}

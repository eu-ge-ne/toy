import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class EndHandler extends EditorHandler {
  keys = [
    Key.create({ name: "END" }),
    Key.create({ name: "RIGHT", super: true }),

    Key.create({ name: "END", shift: true }),
    Key.create({ name: "RIGHT", super: true, shift: true }),
  ];

  handle(key: Key): boolean {
    return this.editor.cursor.end(key.shift);
  }
}

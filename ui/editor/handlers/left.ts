import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class LeftHandler extends EditorHandler {
  keys = [
    Key.create({ name: "LEFT" }),
    Key.create({ name: "LEFT", shift: true }),
  ];

  handle(key: Key): boolean {
    return this.editor.cursor.left(key.shift);
  }
}

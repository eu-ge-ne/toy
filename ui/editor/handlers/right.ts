import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class RightHandler extends EditorHandler {
  keys = [
    Key.create({ name: "RIGHT" }),
    Key.create({ name: "RIGHT", shift: true }),
  ];

  handle(key: Key): boolean {
    return this.editor.cursor.right(key.shift);
  }
}

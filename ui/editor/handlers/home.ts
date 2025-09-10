import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class HomeHandler extends EditorHandler {
  keys = [
    Key.create({ name: "HOME" }),
    Key.create({ name: "LEFT", super: true }),

    Key.create({ name: "HOME", shift: true }),
    Key.create({ name: "LEFT", super: true, shift: true }),
  ];

  handle(key: Key): boolean {
    return this.editor.cursor.home(key.shift);
  }
}

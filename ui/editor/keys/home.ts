import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class HomeHandler extends KeyHandler {
  keys = [
    { name: "HOME" },
    { name: "LEFT", super: true },

    { name: "HOME", shift: true },
    { name: "LEFT", super: true, shift: true },
  ];

  handle(key: Key): boolean {
    return this.editor.cursor.move(
      0,
      -Number.MAX_SAFE_INTEGER,
      Boolean(key.shift),
    );
  }
}

import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class EndHandler extends KeyHandler {
  keys = [
    { name: "END" },
    { name: "RIGHT", super: true },

    { name: "END", shift: true },
    { name: "RIGHT", super: true, shift: true },
  ];

  handle(key: Key): void {
    this.editor.cursor.move(0, Number.MAX_SAFE_INTEGER, Boolean(key.shift));
  }
}

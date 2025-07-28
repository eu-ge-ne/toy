import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class TopHandler extends KeyHandler {
  keys = [
    { name: "UP", super: true },
    { name: "UP", super: true, shift: true },
  ];

  handle(key: Key): void {
    if (this.editor.opts.multi_line) {
      this.editor.cursor.move(-Number.MAX_SAFE_INTEGER, 0, Boolean(key.shift));
    }
  }
}

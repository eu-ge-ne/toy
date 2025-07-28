import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class TopHandler extends KeyHandler {
  keys = [
    { name: "UP", super: true },
    { name: "UP", super: true, shift: true },
  ];

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.move(
      -Number.MAX_SAFE_INTEGER,
      0,
      Boolean(key.shift),
    );
  }
}

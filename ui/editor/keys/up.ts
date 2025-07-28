import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class UpHandler extends KeyHandler {
  keys = [
    { name: "UP" },
    { name: "UP", shift: true },
  ];

  handle(key: Key): void {
    if (this.editor.opts.multi_line) {
      this.editor.cursor.move(-1, 0, Boolean(key.shift));
    }
  }
}

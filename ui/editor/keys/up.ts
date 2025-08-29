import { KittyKey } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class UpHandler extends KeyHandler {
  keys = [
    { name: "UP" },
    { name: "UP", shift: true },
  ];

  handle(key: KittyKey): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.move(-1, 0, Boolean(key.shift));
  }
}

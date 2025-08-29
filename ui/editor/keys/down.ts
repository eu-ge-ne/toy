import { KittyKey } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class DownHandler extends KeyHandler {
  keys = [
    { name: "DOWN" },
    { name: "DOWN", shift: true },
  ];

  handle(key: KittyKey): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.move(1, 0, Boolean(key.shift));
  }
}

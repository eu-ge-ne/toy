import { KittyKey } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class PageUpHandler extends KeyHandler {
  keys = [
    { name: "PAGE_UP" },
    { name: "PAGE_UP", shift: true },
  ];

  handle(key: KittyKey): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.move(-this.editor.h, 0, Boolean(key.shift));
  }
}

import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class PageUpHandler extends KeyHandler {
  keys = [
    { name: "PAGE_UP" },
    { name: "PAGE_UP", shift: true },
  ];

  handle(key: Key): void {
    if (this.editor.opts.multi_line) {
      this.editor.cursor.move(-this.editor.area.h, 0, Boolean(key.shift));
    }
  }
}

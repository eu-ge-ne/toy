import { Key } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class PageDownHandler extends KeyHandler {
  keys = [
    { name: "PAGE_DOWN" },
    { name: "PAGE_DOWN", shift: true },
  ];

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.move(this.editor.h, 0, Boolean(key.shift));
  }
}

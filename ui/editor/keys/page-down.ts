import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class PageDownHandler extends KeyHandler {
  keys = [
    { name: "PAGE_DOWN" },
    { name: "PAGE_DOWN", shift: true },
  ];

  handle(key: Key): void {
    if (this.editor.opts.multi_line) {
      this.editor.cursor.move(this.editor.area.h, 0, Boolean(key.shift));
    }
  }
}

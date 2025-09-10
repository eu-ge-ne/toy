import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class PageUpHandler extends EditorHandler {
  keys = [
    Key.create({ name: "PAGE_UP" }),
    Key.create({ name: "PAGE_UP", shift: true }),
  ];

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.up(this.editor.h, key.shift);
  }
}

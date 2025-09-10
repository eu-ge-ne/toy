import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class PageDownHandler extends EditorHandler {
  keys = [
    Key.create({ name: "PAGE_DOWN" }),
    Key.create({ name: "PAGE_DOWN", shift: true }),
  ];

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.down(this.editor.h, key.shift);
  }
}

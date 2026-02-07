import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class PageUpHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "PAGE_UP";
  }

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.up(this.editor.area.h, key.shift);
  }
}

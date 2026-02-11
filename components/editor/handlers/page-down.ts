import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class PageDownHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "PAGE_DOWN";
  }

  handle(key: Key): boolean {
    if (!this.editor.opts.multiLine) {
      return false;
    }

    return this.editor.cursor.down(this.editor.h, Boolean(key.shift));
  }
}

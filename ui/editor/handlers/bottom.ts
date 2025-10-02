import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class BottomHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "DOWN" && key.super;
  }

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.bottom(key.shift);
  }
}

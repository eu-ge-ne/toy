import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class UpHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "UP";
  }

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.up(1, key.shift);
  }
}

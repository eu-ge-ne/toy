import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class DownHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "DOWN";
  }

  handle(key: Key): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    return this.editor.cursor.down(1, key.shift);
  }
}

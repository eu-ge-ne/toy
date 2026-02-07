import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class DownHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "DOWN";
  }

  handle(key: Key): boolean {
    if (!this.editor.opts.multiLine) {
      return false;
    }

    return this.editor.cursor.down(1, key.shift);
  }
}

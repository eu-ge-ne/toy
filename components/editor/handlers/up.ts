import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class UpHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "UP";
  }

  handle(key: Key): boolean {
    if (!this.editor.opts.multiLine) {
      return false;
    }

    return this.editor.cursor.up(1, Boolean(key.shift));
  }
}

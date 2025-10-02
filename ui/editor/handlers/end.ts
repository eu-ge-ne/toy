import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class EndHandler extends EditorHandler {
  match(key: Key): boolean {
    if (key.name === "END") {
      return true;
    }

    if (key.name === "RIGHT" && key.super) {
      return true;
    }

    return false;
  }

  handle(key: Key): boolean {
    return this.editor.cursor.end(key.shift);
  }
}

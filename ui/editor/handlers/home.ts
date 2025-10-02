import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class HomeHandler extends EditorHandler {
  match(key: Key): boolean {
    if (key.name === "HOME") {
      return true;
    }

    if (key.name === "LEFT" && key.super) {
      return true;
    }

    return false;
  }

  handle(key: Key): boolean {
    return this.editor.cursor.home(key.shift);
  }
}

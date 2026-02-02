import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class LeftHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "LEFT";
  }

  handle(key: Key): boolean {
    return this.editor.cursor.left(key.shift);
  }
}

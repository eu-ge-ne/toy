import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class RightHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "RIGHT";
  }

  handle(key: Key): boolean {
    return this.editor.cursor.right(key.shift);
  }
}

import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class SelectAllHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "a" && (key.ctrl || key.super);
  }

  handle(): boolean {
    const { cursor } = this.editor;

    cursor.set(0, 0, false);
    cursor.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);

    return true;
  }
}

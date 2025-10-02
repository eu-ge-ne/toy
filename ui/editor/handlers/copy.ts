import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class CopyHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "c" && (key.ctrl || key.super);
  }

  handle(): boolean {
    return this.editor.copy();
  }
}

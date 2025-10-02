import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class RedoHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "y" && (key.ctrl || key.super);
  }

  handle(): boolean {
    return this.editor.history.redo();
  }
}

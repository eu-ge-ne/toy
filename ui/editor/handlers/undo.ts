import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class UndoHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "z" && (key.ctrl || key.super);
  }

  handle(): boolean {
    return this.editor.history.undo();
  }
}

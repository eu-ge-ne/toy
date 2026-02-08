import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class SelectAllHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "a" && (key.ctrl || key.super);
  }

  handle(): boolean {
    return this.editor.selectAll();
  }
}

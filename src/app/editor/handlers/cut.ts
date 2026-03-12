import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class CutHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "x" && Boolean(key.ctrl || key.super);
  }

  handle(): boolean {
    return this.editor.cut();
  }
}

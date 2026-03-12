import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class PasteHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "v" && Boolean(key.ctrl || key.super);
  }

  handle(): boolean {
    return this.editor.paste();
  }
}

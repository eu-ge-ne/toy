import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class TextHandler extends EditorHandler {
  keys = [];

  override match(key: Key): boolean {
    return typeof key.text === "string";
  }

  handle(key: Key): boolean {
    this.editor.insert(key.text!);

    return true;
  }
}

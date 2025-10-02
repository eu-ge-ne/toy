import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class TextHandler extends EditorHandler {
  match(key: Key): boolean {
    return typeof key.text === "string";
  }

  handle(key: Key): boolean {
    this.editor.insert(key.text!);

    return true;
  }
}

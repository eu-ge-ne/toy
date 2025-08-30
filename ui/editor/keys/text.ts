import { Key } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class TextHandler extends KeyHandler {
  keys = [];

  override match(key: Key | string): boolean {
    return typeof key === "string" || typeof key.text === "string";
  }

  handle(key: Key | string): boolean {
    const text = typeof key === "string" ? key : key.text!;

    this.editor.insert(text);

    return true;
  }
}

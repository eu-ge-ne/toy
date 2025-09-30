import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class PasteHandler extends EditorHandler {
  keys = [
    Key.create({ name: "v", ctrl: true }),
    Key.create({ name: "v", super: true }),
  ];

  handle(): boolean {
    return this.editor.paste();
  }
}

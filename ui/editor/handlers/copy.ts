import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class CopyHandler extends EditorHandler {
  keys = [
    Key.create({ name: "c", ctrl: true }),
    Key.create({ name: "c", super: true }),
  ];

  handle(): boolean {
    return this.editor.copy();
  }
}

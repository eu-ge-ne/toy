import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class CutHandler extends EditorHandler {
  keys = [
    Key.create({ name: "x", ctrl: true }),
    Key.create({ name: "x", super: true }),
  ];

  handle(): boolean {
    return this.editor.cut();
  }
}

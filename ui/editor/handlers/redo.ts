import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class RedoHandler extends EditorHandler {
  keys = [
    Key.create({ name: "y", ctrl: true }),
    Key.create({ name: "y", super: true }),
  ];

  handle(): boolean {
    return this.editor.history.redo();
  }
}

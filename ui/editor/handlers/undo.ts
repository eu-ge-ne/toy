import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class UndoHandler extends EditorHandler {
  keys = [
    Key.create({ name: "z", ctrl: true }),
    Key.create({ name: "z", super: true }),
  ];

  handle(): boolean {
    return this.editor.history.undo();
  }
}

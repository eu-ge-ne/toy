import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class SelectAllHandler extends EditorHandler {
  keys = [
    Key.create({ name: "a", ctrl: true }),
    Key.create({ name: "a", super: true }),
  ];

  handle(): boolean {
    const { cursor } = this.editor;

    cursor.set(0, 0, false);
    cursor.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);

    return true;
  }
}

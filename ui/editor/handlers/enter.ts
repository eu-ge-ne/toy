import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class EnterHandler extends EditorHandler {
  keys = [
    Key.create({ name: "ENTER" }),
  ];

  handle(): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    this.editor.insert("\n");

    return true;
  }
}

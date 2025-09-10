import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class BackspaceHandler extends EditorHandler {
  keys = [
    Key.create({ name: "BACKSPACE" }),
  ];

  handle(): boolean {
    if (this.editor.cursor.selecting) {
      this.editor.delete_selection();
    } else {
      this.editor.backspace();
    }

    return true;
  }
}

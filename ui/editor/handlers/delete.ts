import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class DeleteHandler extends EditorHandler {
  keys = [
    Key.create({ name: "DELETE" }),
  ];

  handle(): boolean {
    if (this.editor.cursor.selecting) {
      this.editor.delete_selection();
    } else {
      this.editor.delete_char();
    }

    return true;
  }
}

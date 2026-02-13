import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class DeleteHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "DELETE";
  }

  handle(): boolean {
    if (this.editor.cursor.selecting) {
      this.editor.deleteSelection();
    } else {
      this.editor.deleteChar();
    }

    return true;
  }
}

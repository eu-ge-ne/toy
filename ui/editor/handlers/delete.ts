import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class DeleteHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "DELETE";
  }

  handle(): boolean {
    if (this.editor.cursor.selecting) {
      this.editor.delete_selection();
    } else {
      this.editor.delete_char();
    }

    return true;
  }
}

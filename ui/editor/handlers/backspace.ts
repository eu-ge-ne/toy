import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class BackspaceHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "BACKSPACE";
  }

  handle(): boolean {
    if (this.editor.cursor.selecting) {
      this.editor.delete_selection();
    } else {
      this.editor.backspace();
    }

    return true;
  }
}

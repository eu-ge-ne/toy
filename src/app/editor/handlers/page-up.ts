import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class PageUpHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "PAGE_UP";
  }

  handle(key: Key): boolean {
    if (!this.editor.params.multiLine) {
      return false;
    }

    return this.editor.cursor.up(this.editor.height, Boolean(key.shift));
  }
}

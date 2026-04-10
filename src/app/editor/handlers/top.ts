import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class TopHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "UP" && Boolean(key.super);
  }

  handle(key: Key): boolean {
    if (!this.editor.props.multiLine) {
      return false;
    }

    return this.editor.cursor.top(Boolean(key.shift));
  }
}

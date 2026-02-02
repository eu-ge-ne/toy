import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class EnterHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "ENTER";
  }

  handle(): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    this.editor.insert("\n");

    return true;
  }
}

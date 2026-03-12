import { Key } from "@lib/kitty";

import { EditorHandler } from "./handler.ts";

export class TabHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "TAB";
  }

  handle(): boolean {
    if (this.editor.opts.multiLine) {
      this.editor.insert("\t");

      return true;
    }

    return false;
  }
}

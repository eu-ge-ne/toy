import { Key } from "@lib/key";

import { EditorHandler } from "./handler.ts";

export class TabHandler extends EditorHandler {
  match(key: Key): boolean {
    return key.name === "TAB";
  }

  handle(): boolean {
    if (this.editor.opts.multi_line) {
      this.editor.insert("\t");

      return true;
    }

    return false;
  }
}

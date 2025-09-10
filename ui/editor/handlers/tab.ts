import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class TabHandler extends EditorHandler {
  keys = [
    Key.create({ name: "TAB" }),
  ];

  handle(): boolean {
    if (this.editor.opts.multi_line) {
      this.editor.insert("\t");

      return true;
    }

    return false;
  }
}

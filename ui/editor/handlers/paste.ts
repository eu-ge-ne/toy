import { Key } from "@lib/vt";

import { EditorHandler } from "./handler.ts";

export class PasteHandler extends EditorHandler {
  keys = [
    Key.create({ name: "v", ctrl: true }),
    Key.create({ name: "v", super: true }),
  ];

  handle(): boolean {
    if (this.editor.clipboard) {
      this.editor.insert(this.editor.clipboard);

      return true;
    }

    return false;
  }
}

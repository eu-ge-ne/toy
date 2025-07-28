import { KeyHandler } from "./handler.ts";

export class PasteHandler extends KeyHandler {
  keys = [
    { name: "v", ctrl: true },
    { name: "v", super: true },
  ];

  handle(): boolean {
    if (this.editor.clipboard) {
      this.editor.insert(this.editor.clipboard);

      return true;
    }

    return false;
  }
}

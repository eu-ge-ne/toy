import { KeyHandler } from "./handler.ts";

export class Paste extends KeyHandler {
  keys = [
    { name: "v", ctrl: true },
    { name: "v", super: true },
  ];

  handle(): void {
    const { clipboard } = this.editor;

    if (clipboard.length > 0) {
      this.editor.insert(clipboard);
    }
  }
}

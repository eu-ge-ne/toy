import { KeyHandler } from "./handler.ts";

export class EnterHandler extends KeyHandler {
  keys = [
    { name: "ENTER" },
  ];

  handle(): boolean {
    if (!this.editor.opts.multi_line) {
      return false;
    }

    this.editor.insert("\n");

    return true;
  }
}

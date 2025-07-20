import { KeyHandler } from "./handler.ts";

export class Enter extends KeyHandler {
  keys = [
    { name: "ENTER" },
  ];

  handle(): void {
    if (this.editor.opts.multi_line) {
      this.editor.insert("\n");
    }
  }
}

import { KeyHandler } from "./handler.ts";

export class TabHandler extends KeyHandler {
  keys = [
    { name: "TAB" },
  ];

  handle(): void {
    if (this.editor.opts.multi_line) {
      this.editor.insert("\t");
    }
  }
}

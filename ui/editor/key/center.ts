import { KeyHandler } from "./handler.ts";

export class Center extends KeyHandler {
  keys = [
    { name: "ESC" },
  ];

  handle(): void {
    const { opts, scroll } = this.editor;

    if (opts.multi_line) {
      scroll.center();
    }
  }
}

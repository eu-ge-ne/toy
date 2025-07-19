import { KeyHandler } from "./handler.ts";

export class Center extends KeyHandler {
  keys = [
    { name: "ESC" },
  ];

  handle(): void {
    const { opts, view } = this.editor;

    if (opts.multi_line) {
      view.center();
    }
  }
}

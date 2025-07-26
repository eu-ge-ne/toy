import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class Top extends KeyHandler {
  keys = [
    { name: "UP", super: true },
    { name: "UP", super: true, shift: true },
  ];

  handle({ shift }: Key): void {
    const { opts, cursor } = this.editor;

    if (opts.multi_line) {
      const select = Boolean(shift);

      cursor.move(-Number.MAX_SAFE_INTEGER, 0, select);
    }
  }
}

export class Bottom extends KeyHandler {
  keys = [
    { name: "DOWN", super: true },
    { name: "DOWN", super: true, shift: true },
  ];

  handle({ shift }: Key): void {
    const { opts, cursor } = this.editor;

    if (opts.multi_line) {
      const select = Boolean(shift);

      cursor.move(Number.MAX_SAFE_INTEGER, 0, select);
    }
  }
}

import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class Home extends KeyHandler {
  keys = [
    { name: "HOME" },
    { name: "LEFT", super: true },

    { name: "HOME", shift: true },
    { name: "LEFT", super: true, shift: true },
  ];

  handle({ shift }: Key): void {
    const select = Boolean(shift);

    this.editor.cursor.move(0, -Number.MAX_SAFE_INTEGER, select);
  }
}

export class End extends KeyHandler {
  keys = [
    { name: "END" },
    { name: "RIGHT", super: true },

    { name: "END", shift: true },
    { name: "RIGHT", super: true, shift: true },
  ];

  handle({ shift }: Key): void {
    const select = Boolean(shift);

    this.editor.cursor.move(0, Number.MAX_SAFE_INTEGER, select);
  }
}

import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class Left extends KeyHandler {
  keys = [
    { name: "LEFT" },
    { name: "LEFT", shift: true },
  ];

  handle({ shift }: Key): void {
    const { cursor } = this.editor;

    const select = Boolean(shift);

    if (!cursor.move(0, -1, select) && cursor.ln > 0) {
      cursor.move(-1, Number.MAX_SAFE_INTEGER, select);
    }
  }
}

export class Right extends KeyHandler {
  keys = [
    { name: "RIGHT" },
    { name: "RIGHT", shift: true },
  ];

  handle({ shift }: Key): void {
    const { cursor, buf } = this.editor;

    const select = Boolean(shift);

    if (!cursor.move(0, 1, select) && cursor.ln < (buf.ln_count - 1)) {
      cursor.move(1, Number.MIN_SAFE_INTEGER, select);
    }
  }
}

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

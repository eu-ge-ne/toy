import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class RightHandler extends KeyHandler {
  keys = [
    { name: "RIGHT" },
    { name: "RIGHT", shift: true },
  ];

  handle(key: Key): boolean {
    const { cursor, buffer } = this.editor;
    const select = Boolean(key.shift);

    if (!cursor.move(0, 1, select) && cursor.ln < (buffer.ln_count - 1)) {
      return cursor.move(1, Number.MIN_SAFE_INTEGER, select);
    }

    return false;
  }
}

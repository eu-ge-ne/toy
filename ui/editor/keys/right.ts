import { KittyKey } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class RightHandler extends KeyHandler {
  keys = [
    { name: "RIGHT" },
    { name: "RIGHT", shift: true },
  ];

  handle(key: KittyKey): boolean {
    const { cursor, buffer } = this.editor;
    const select = Boolean(key.shift);

    if (cursor.move(0, 1, select)) {
      return true;
    }

    if (cursor.ln < buffer.line_count - 1) {
      return cursor.move(1, Number.MIN_SAFE_INTEGER, select);
    }

    return false;
  }
}

import { Key } from "@lib/vt";

import { KeyHandler } from "./handler.ts";

export class LeftHandler extends KeyHandler {
  keys = [
    { name: "LEFT" },
    { name: "LEFT", shift: true },
  ];

  handle(key: Key): boolean {
    const { cursor } = this.editor;
    const select = Boolean(key.shift);

    if (cursor.move(0, -1, select)) {
      return true;
    }

    if (cursor.ln > 0) {
      return cursor.move(-1, Number.MAX_SAFE_INTEGER, select);
    }

    return false;
  }
}

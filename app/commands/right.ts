import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class RightCommand extends Command {
  keys = [
    { name: "RIGHT" },
    { name: "RIGHT", shift: true },
  ];

  async command(key: Key): Promise<Command | undefined> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor, buffer } = editor;
    const select = Boolean(key.shift);

    if (!cursor.move(0, 1, select) && cursor.ln < (buffer.ln_count - 1)) {
      cursor.move(1, Number.MIN_SAFE_INTEGER, select);
    }

    editor.render();
  }
}

import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class LeftCommand extends Command {
  keys = [
    { name: "LEFT" },
    { name: "LEFT", shift: true },
  ];

  async command(key: Key): Promise<Command | undefined> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor } = editor;
    const select = Boolean(key.shift);

    if (!cursor.move(0, -1, select) && cursor.ln > 0) {
      cursor.move(-1, Number.MAX_SAFE_INTEGER, select);
    }

    editor.render();
  }
}

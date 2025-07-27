import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class EndCommand extends Command {
  keys = [
    { name: "END" },
    { name: "RIGHT", super: true },

    { name: "END", shift: true },
    { name: "RIGHT", super: true, shift: true },
  ];

  async command(key: Key): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.cursor.move(0, Number.MAX_SAFE_INTEGER, Boolean(key.shift));

    editor.render();
  }
}

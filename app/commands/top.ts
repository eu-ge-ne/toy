import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class TopCommand extends Command {
  keys = [
    { name: "UP", super: true },
    { name: "UP", super: true, shift: true },
  ];

  async command(key: Key): Promise<Command | undefined> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    editor.cursor.move(-Number.MAX_SAFE_INTEGER, 0, Boolean(key.shift));

    editor.render();
  }
}

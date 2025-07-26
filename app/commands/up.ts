import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class UpCommand extends Command {
  override name = "Up";

  keys = [
    { name: "UP" },
    { name: "UP", shift: true },
  ];

  async command(key: Key): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    editor.cursor.move(-1, 0, Boolean(key.shift));

    editor.render();
  }
}

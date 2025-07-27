import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class UpCommand extends Command {
  keys = [
    { name: "UP" },
    { name: "UP", shift: true },
  ];

  async command(key: Key): Promise<void> {
    const { palette } = this.app.ui;

    if (palette.enabled) {
      palette.on_up_key();
      palette.render();
    }

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

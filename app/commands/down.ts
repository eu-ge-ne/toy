import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class DownCommand extends Command {
  keys = [
    { name: "DOWN" },
    { name: "DOWN", shift: true },
  ];

  protected override async command(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    editor.cursor.move(1, 0, Boolean(key.shift));

    editor.render();
  }
}

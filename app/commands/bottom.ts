import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class BottomCommand extends Command {
  keys = [
    { name: "DOWN", super: true },
    { name: "DOWN", super: true, shift: true },
  ];

  protected override async command(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    editor.cursor.move(Number.MAX_SAFE_INTEGER, 0, Boolean(key.shift));

    editor.render();
  }
}

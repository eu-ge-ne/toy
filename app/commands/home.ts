import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class HomeCommand extends Command {
  keys = [
    { name: "HOME" },
    { name: "LEFT", super: true },

    { name: "HOME", shift: true },
    { name: "LEFT", super: true, shift: true },
  ];

  protected override async command(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.cursor.move(0, -Number.MAX_SAFE_INTEGER, Boolean(key.shift));

    editor.render();
  }
}

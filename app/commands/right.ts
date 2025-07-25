import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class RightCommand extends Command {
  keys = [
    { name: "RIGHT" },
    { name: "RIGHT", shift: true },
  ];

  protected override async command(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
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

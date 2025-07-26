import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class PageUpCommand extends Command {
  override name = "Page Up";

  keys = [
    { name: "PAGE_UP" },
    { name: "PAGE_UP", shift: true },
  ];

  async command(key: Key): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    editor.cursor.move(-editor.area.h, 0, Boolean(key.shift));

    editor.render();
  }
}

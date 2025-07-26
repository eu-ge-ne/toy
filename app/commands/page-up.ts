import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class PageUpCommand extends Command {
  keys = [
    { name: "PAGE_UP" },
    { name: "PAGE_UP", shift: true },
  ];

  protected override async command(key: Key): Promise<void> {
    const editor = this.app.focused_editor;
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

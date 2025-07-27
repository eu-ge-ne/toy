import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class PageDownCommand extends Command {
  keys = [
    { name: "PAGE_DOWN" },
    { name: "PAGE_DOWN", shift: true },
  ];

  async command(key: Key): Promise<Command | undefined> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    editor.cursor.move(editor.area.h, 0, Boolean(key.shift));

    editor.render();
  }
}

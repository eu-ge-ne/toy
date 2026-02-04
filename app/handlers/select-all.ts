import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export class SelectAllCommand extends Command {
  keys = [];

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    if (this.app.editor.enabled) {
      this.app.editor.cursor.set(0, 0, false);
      this.app.editor.cursor.set(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        true,
      );

      this.app.editor.render();
    }
  }
}

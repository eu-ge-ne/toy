import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export class UndoCommand extends Command {
  keys = [];

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    if (!this.app.editor.enabled) {
      return;
    }

    if (this.app.editor.history.undo()) {
      this.app.editor.render();
    }
  }
}

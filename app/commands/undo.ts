import { Key } from "@lib/kitty";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class UndoCommand extends Command {
  keys = [];

  option = new PaletteOption(
    "Undo",
    "Edit: Undo",
    [
      Key.create({ name: "z", ctrl: true }),
      Key.create({ name: "z", super: true }),
    ],
  );

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

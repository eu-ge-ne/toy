import { Key } from "@lib/vt";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class RedoCommand extends Command {
  keys = [];

  option = new PaletteOption(
    "Redo",
    "Edit: Redo",
    [
      Key.create({ name: "y", ctrl: true }),
      Key.create({ name: "y", super: true }),
    ],
  );

  async run(): Promise<void> {
    if (!this.app.editor.enabled) {
      return;
    }

    if (this.app.editor.history.redo()) {
      this.app.editor.render();
    }
  }
}

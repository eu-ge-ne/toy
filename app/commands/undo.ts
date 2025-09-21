import { Key } from "@lib/vt";
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

  async run(): Promise<void> {
    if (this.app.editor.enabled) {
      this.app.editor.handle_key(Key.create({ name: "z", ctrl: true }));

      this.app.editor.render();
    }
  }
}

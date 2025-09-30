import { Key } from "@lib/vt";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class PasteCommand extends Command {
  keys = [];

  option = new PaletteOption(
    "Paste",
    "Edit: Paste",
    [
      Key.create({ name: "v", ctrl: true }),
      Key.create({ name: "v", super: true }),
    ],
  );

  async run(): Promise<void> {
    if (this.app.editor.enabled) {
      if (this.app.editor.paste()) {
        this.app.editor.render();
      }
    }
  }
}

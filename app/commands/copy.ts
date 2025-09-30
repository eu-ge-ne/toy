import { Key } from "@lib/vt";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class CopyCommand extends Command {
  keys = [];

  option = new PaletteOption(
    "Copy",
    "Edit: Copy",
    [
      Key.create({ name: "c", ctrl: true }),
      Key.create({ name: "c", super: true }),
    ],
  );

  async run(): Promise<void> {
    if (this.app.editor.enabled) {
      if (this.app.editor.copy()) {
        this.app.editor.render();
      }
    }
  }
}

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
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "v", ctrl: true }));

      editor.render();
    }
  }
}

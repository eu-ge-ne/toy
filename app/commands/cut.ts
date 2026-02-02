import { Key } from "@lib/kitty";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class CutCommand extends Command {
  keys = [];

  option = new PaletteOption(
    "Cut",
    "Edit: Cut",
    [
      Key.create({ name: "x", ctrl: true }),
      Key.create({ name: "x", super: true }),
    ],
  );

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    if (this.app.editor.enabled) {
      if (this.app.editor.cut()) {
        this.app.editor.render();
      }
    }
  }
}

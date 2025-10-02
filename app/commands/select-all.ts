import { Key } from "@lib/key";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class SelectAllCommand extends Command {
  keys = [];

  option = new PaletteOption(
    "Select All",
    "Edit: Select All",
    [
      Key.create({ name: "a", ctrl: true }),
      Key.create({ name: "a", super: true }),
    ],
  );

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

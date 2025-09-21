import { Key } from "@lib/vt";
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

  async run(): Promise<void> {
    if (this.app.editor.enabled) {
      this.app.editor.handle_key(Key.create({ name: "a", ctrl: true }));

      this.app.editor.render();
    }
  }
}

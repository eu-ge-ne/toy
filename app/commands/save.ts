import { Key } from "@lib/vt";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class SaveCommand extends Command {
  keys = [
    Key.create({ name: "F2" }),
  ];

  option = new PaletteOption("Save", "Global: Save", this.keys);

  async run(): Promise<void> {
    await this.app.trySaveFile();
  }
}

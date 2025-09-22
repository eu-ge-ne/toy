import { Key } from "@lib/vt";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class ExitCommand extends Command {
  keys = [
    Key.create({ name: "F10" }),
  ];

  option = new PaletteOption("Exit", "Global: Exit", this.keys);

  async run(): Promise<void> {
    this.app.editor.enabled = false;

    if (this.app.changes) {
      if (await this.app.ask.open("Save changes?")) {
        await this.app.file.save();
      }
    }

    this.app.exit();
  }
}

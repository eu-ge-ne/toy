import { Key } from "@lib/key";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class ExitCommand extends Command {
  keys = [
    Key.create({ name: "F10" }),
  ];

  option = new PaletteOption("Exit", "Global: Exit", this.keys);

  match(key: Key): boolean {
    return key.name === "F10";
  }

  async run(): Promise<void> {
    this.app.editor.enabled = false;

    if (!this.app.editor.history.is_empty) {
      if (await this.app.ask.open("Save changes?")) {
        await this.app.save();
      }
    }

    this.app.exit();
  }
}

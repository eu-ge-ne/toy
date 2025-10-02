import { Key } from "@lib/key";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class SaveCommand extends Command {
  keys = [
    Key.create({ name: "F2" }),
  ];

  option = new PaletteOption("Save", "Global: Save", this.keys);

  match(key: Key): boolean {
    return key.name === "F2";
  }

  async run(): Promise<void> {
    this.app.editor.enabled = false;

    if (await this.app.save()) {
      this.app.editor.reset(false);
    }

    this.app.editor.enabled = true;

    this.app.editor.render();
  }
}

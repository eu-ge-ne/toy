import { Key } from "@lib/kitty";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class WrapCommand extends Command {
  keys = [
    Key.create({ name: "F6" }),
  ];

  option = new PaletteOption("Wrap", "View: Toggle Line Wrap", this.keys);

  match(key: Key): boolean {
    return key.name === "F6";
  }

  async run(): Promise<void> {
    this.app.editor.wrap_enabled = !this.app.editor.wrap_enabled;
    this.app.editor.cursor.home(false);

    this.app.editor.render();
  }
}

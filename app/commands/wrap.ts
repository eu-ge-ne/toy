import { Key } from "@lib/vt";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class WrapCommand extends Command {
  keys = [
    Key.create({ name: "F6" }),
  ];

  option = new PaletteOption("Wrap", "View: Toggle Line Wrap", this.keys);

  async run(): Promise<void> {
    this.app.editor.wrap_enabled = !this.app.editor.wrap_enabled;
    this.app.editor.cursor.home(false);

    this.app.editor.render();
  }
}

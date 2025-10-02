import { Key } from "@lib/key";
import { GRAY } from "@lib/theme";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class ThemeGrayCommand extends Command {
  keys = [];

  option = new PaletteOption("Theme Gray", "Theme: Gray", []);

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    this.app.set_colors(GRAY);

    this.app.render();
  }
}

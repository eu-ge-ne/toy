import { STONE } from "@lib/theme";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class ThemeStoneCommand extends Command {
  keys = [];

  option = new PaletteOption("Theme Stone", "Theme: Stone", []);

  async run(): Promise<void> {
    this.app.set_colors(STONE);

    this.app.render();
  }
}

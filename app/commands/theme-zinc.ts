import { Key } from "@lib/kitty";
import { ZINC } from "@lib/theme";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class ThemeZincCommand extends Command {
  keys = [];

  option = new PaletteOption("Theme Zinc", "Theme: Zinc", []);

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    this.app.set_colors(ZINC);

    this.app.render();
  }
}

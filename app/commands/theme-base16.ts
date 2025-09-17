import { BASE16 } from "@lib/theme";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class ThemeBase16Command extends Command {
  keys = [];

  option = new PaletteOption("Theme Base16", "Theme: Base16", []);

  async run(): Promise<void> {
    this.app.set_colors(BASE16);

    this.app.render();
  }
}

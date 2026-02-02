import { Key } from "@lib/kitty";
import { SLATE } from "@lib/theme";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class ThemeSlateCommand extends Command {
  keys = [];

  option = new PaletteOption("Theme Slate", "Theme: Slate", []);

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    this.app.set_colors(SLATE);

    this.app.render();
  }
}

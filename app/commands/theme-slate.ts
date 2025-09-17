import { SLATE } from "@lib/theme";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class ThemeSlateCommand extends Command {
  keys = [];

  option = new Option("Theme Slate", "Theme: Slate", []);

  async run(): Promise<void> {
    this.app.set_colors(SLATE);

    this.app.render();
  }
}

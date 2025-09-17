import { NEUTRAL } from "@lib/theme";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class ThemeNeutralCommand extends Command {
  keys = [];

  option = new Option("Theme Neutral", "Theme: Neutral", []);

  async run(): Promise<void> {
    this.app.set_colors(NEUTRAL);

    this.app.render();
  }
}

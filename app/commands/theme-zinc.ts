import { ZINC } from "@lib/theme";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class ThemeZincCommand extends Command {
  keys = [];

  option = new Option("Theme Zinc", "Theme: Zinc", []);

  async run(): Promise<void> {
    this.app.set_colors(ZINC);

    this.app.render();
  }
}

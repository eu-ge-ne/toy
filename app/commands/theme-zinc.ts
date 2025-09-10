import { ZINC } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeZincCommand extends Command {
  keys = [];

  option = {
    id: "Theme Zinc",
    description: "Theme: Zinc",
  };

  async command(): Promise<void> {
    this.app.set_colors(ZINC);
    this.app.render();
  }
}

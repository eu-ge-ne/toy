import { NEUTRAL } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeNeutralCommand extends Command {
  match_keys = [];

  option = {
    id: "Theme Neutral",
    description: "Theme: Neutral",
  };

  async command(): Promise<void> {
    this.app.set_colors(NEUTRAL);
    this.app.render();
  }
}

import { NEUTRAL, switch_theme } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeNeutralCommand extends Command {
  match_keys = [];

  option = {
    id: "Theme Neutral",
    description: "Theme: Neutral",
  };

  async command(): Promise<void> {
    switch_theme(NEUTRAL);

    this.app.render();
  }
}

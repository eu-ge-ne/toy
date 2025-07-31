import { switch_theme, ZINC } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeZincCommand extends Command {
  match_keys = [];

  option = {
    id: "Theme Zinc",
    description: "Theme: Zinc",
  };

  async command(): Promise<void> {
    switch_theme(ZINC);

    this.app.render();
  }
}

import { STONE, switch_theme } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeStoneCommand extends Command {
  match_keys = [];

  option = {
    id: "Theme Stone",
    description: "Theme: Stone",
  };

  async command(): Promise<void> {
    switch_theme(STONE);

    this.app.render();
  }
}

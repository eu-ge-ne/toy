import { STONE } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeStoneCommand extends Command {
  keys = [];

  option = {
    id: "Theme Stone",
    description: "Theme: Stone",
  };

  async command(): Promise<void> {
    this.app.set_colors(STONE);
    this.app.render();
  }
}

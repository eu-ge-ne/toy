import { GRAY } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeGrayCommand extends Command {
  keys = [];

  option = {
    id: "Theme Gray",
    description: "Theme: Gray",
  };

  async run(): Promise<void> {
    this.app.set_colors(GRAY);

    this.app.render();
  }
}

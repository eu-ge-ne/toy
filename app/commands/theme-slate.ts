import { SLATE } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeSlateCommand extends Command {
  keys = [];

  option = {
    id: "Theme Slate",
    description: "Theme: Slate",
  };

  async run(): Promise<void> {
    this.app.set_colors(SLATE);

    this.app.render();
  }
}

import { SLATE } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeSlateCommand extends Command {
  match_keys = [];

  option = {
    id: "Theme Slate",
    description: "Theme: Slate",
  };

  async command(): Promise<void> {
    this.app.set_colors(SLATE);
    this.app.render();
  }
}

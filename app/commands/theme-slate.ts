import { SLATE, switch_theme } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeSlateCommand extends Command {
  match_keys = [];

  option = {
    id: "ThemeSlate",
    description: "Theme: Slate",
  };

  async command(): Promise<void> {
    switch_theme(SLATE);

    this.app.render();
  }
}

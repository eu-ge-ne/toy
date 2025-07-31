import { GRAY, switch_theme } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeGrayCommand extends Command {
  match_keys = [];

  option = {
    id: "Theme Gray",
    description: "Theme: Gray",
  };

  async command(): Promise<void> {
    switch_theme(GRAY);

    this.app.render();
  }
}

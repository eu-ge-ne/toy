import { BASE16 } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeBase16Command extends Command {
  keys = [];

  option = {
    id: "Theme Base16",
    description: "Theme: Base16",
  };

  async command(): Promise<void> {
    this.app.set_colors(BASE16);
    this.app.render();
  }
}

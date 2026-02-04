import { Key } from "@lib/kitty";
import { NEUTRAL } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeNeutralCommand extends Command {
  keys = [];

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    this.app.set_colors(NEUTRAL);

    this.app.render();
  }
}

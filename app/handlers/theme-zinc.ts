import { Key } from "@lib/kitty";
import { ZINC } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeZincCommand extends Command {
  keys = [];

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    this.app.set_colors(ZINC);

    this.app.render();
  }
}

import { Key } from "@lib/kitty";
import { STONE } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeStoneCommand extends Command {
  keys = [];

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    this.app.set_colors(STONE);

    this.app.render();
  }
}

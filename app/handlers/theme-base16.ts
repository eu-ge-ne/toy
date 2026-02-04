import { Key } from "@lib/kitty";
import { BASE16 } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeBase16Command extends Command {
  keys = [];

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    this.app.set_colors(BASE16);

    this.app.render();
  }
}

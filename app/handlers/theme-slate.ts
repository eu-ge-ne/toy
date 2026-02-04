import { Key } from "@lib/kitty";
import { SLATE } from "@lib/theme";

import { Command } from "./command.ts";

export class ThemeSlateCommand extends Command {
  keys = [];

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    this.app.set_colors(SLATE);

    this.app.render();
  }
}

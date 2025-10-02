import { Key } from "@lib/key";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class DebugCommand extends Command {
  keys = [];

  option = new PaletteOption("Debug", "Global: Toggle Debug Panel", []);

  match(_: Key): boolean {
    return false;
  }

  async run(): Promise<void> {
    this.app.debug.enabled = !this.app.debug.enabled;

    this.app.editor.render();
  }
}

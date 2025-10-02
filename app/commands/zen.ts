import { Key } from "@lib/key";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class ZenCommand extends Command {
  keys = [
    Key.create({ name: "F11" }),
  ];

  option = new PaletteOption("Zen", "Global: Toggle Zen Mode", this.keys);

  match(key: Key): boolean {
    return key.name === "F11";
  }

  async run(): Promise<void> {
    this.app.enable_zen(!this.app.zen_enabled);
  }
}

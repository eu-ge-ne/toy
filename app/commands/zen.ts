import { Key } from "@lib/vt";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class ZenCommand extends Command {
  keys = [
    Key.create({ name: "F11" }),
  ];

  option = new Option("Zen", "Global: Toggle Zen Mode", this.keys);

  async run(): Promise<void> {
    this.app.enable_zen(!this.app.zen_enabled);
  }
}

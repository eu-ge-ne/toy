import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class ZenCommand extends Command {
  keys = [
    Key.create({ name: "F11" }),
  ];

  option = {
    id: "Zen",
    description: "Global: Toggle Zen Mode",
    shortcuts: display_keys(this.keys),
  };

  async command(): Promise<void> {
    this.app.enable_zen(!this.app.zen_enabled);
  }
}

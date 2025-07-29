import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class ZenCommand extends Command {
  match_keys = [
    { name: "F11" },
  ];

  option = {
    id: "Zen",
    description: "Global: Toggle Zen Mode",
    shortcuts: display_keys(this.match_keys),
  };

  async command(): Promise<void> {
    this.app.enable_zen(!this.app.zen_enabled);
  }
}

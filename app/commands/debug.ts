import { display_keys } from "@lib/input";

import { Command } from "./command.ts";

export class DebugCommand extends Command {
  match_keys = [
    { name: "F9" },
  ];

  option = {
    id: "Debug",
    description: "Global: Toggle Debug Panel",
    shortcuts: display_keys(this.match_keys),
  };

  async command(): Promise<void> {
    const { debug, editor } = this.app.ui;

    debug.enabled = !debug.enabled;

    editor.render();
  }
}

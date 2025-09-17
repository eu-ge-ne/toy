import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class DebugCommand extends Command {
  keys = [];

  option = new Option("Debug", "Global: Toggle Debug Panel", []);

  async run(): Promise<void> {
    const { debug, editor } = this.app.ui;

    debug.enabled = !debug.enabled;

    editor.render();
  }
}

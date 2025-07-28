import { Command } from "./command.ts";

export class DebugCommand extends Command {
  override option = {
    name: "Debug",
    description: "Global: Toggle Debug Panel",
  };

  keys = [
    { name: "F9" },
  ];

  async command(): Promise<void> {
    const { debug, editor } = this.app.ui;

    debug.enabled = !debug.enabled;

    editor.render();
  }
}

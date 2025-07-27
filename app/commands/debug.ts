import { Command } from "./command.ts";

export class DebugCommand extends Command {
  override option = {
    name: "Debug",
    description: "Toggle debug panel",
  };

  keys = [
    { name: "F9" },
  ];

  async command(): Promise<Command | undefined> {
    if (Command.started > 1) {
      return;
    }

    const { debug, editor } = this.app.ui;

    debug.enabled = !debug.enabled;

    editor.render();
  }
}

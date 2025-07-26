import { Command } from "./command.ts";

export class DebugCommand extends Command {
  keys = [
    { name: "F9" },
  ];

  protected override async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { debug, editor } = this.app.ui;

    debug.enabled = !debug.enabled;

    editor.render();
  }
}

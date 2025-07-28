import { Command } from "./command.ts";

export class WrapCommand extends Command {
  override option = {
    name: "Wrap",
    description: "View: Toggle Line Wrap",
  };

  keys = [
    { name: "F6" },
  ];

  async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { editor } = this.app.ui;

    editor.wrap_enabled = !editor.wrap_enabled;
    editor.cursor.move(0, -Number.MAX_SAFE_INTEGER, false);

    editor.render();
  }
}

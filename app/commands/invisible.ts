import { Command } from "./command.ts";

export class InvisibleCommand extends Command {
  override option = {
    name: "Invisible",
    description: "Toggle invisible characters",
  };

  keys = [
    { name: "F5" },
  ];

  async command(): Promise<Command | undefined> {
    if (Command.started > 1) {
      return;
    }

    const { editor } = this.app.ui;

    editor.invisible_enabled = !editor.invisible_enabled;

    editor.render();
  }
}

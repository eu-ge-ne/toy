import { Command } from "./command.ts";

export class InvisibleCommand extends Command {
  name = "Invisible";
  override palette = true;

  keys = [
    { name: "F5" },
  ];

  async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { editor } = this.app.ui;

    editor.invisible_enabled = !editor.invisible_enabled;

    editor.render();
  }
}

import { Command } from "./command.ts";

export class InvisibleCommand extends Command {
  keys = [
    { name: "F5" },
  ];

  protected override async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { editor } = this.app.ui;

    editor.invisible_enabled = !editor.invisible_enabled;

    editor.render();
  }
}

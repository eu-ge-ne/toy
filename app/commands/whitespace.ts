import { Command } from "./command.ts";

export class WhitespaceCommand extends Command {
  override option = {
    name: "Whitespace",
    description: "View: Toggle Render Whitespace",
  };

  keys = [
    { name: "F5" },
  ];

  async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { editor } = this.app.ui;

    editor.whitespace_enabled = !editor.whitespace_enabled;

    editor.render();
  }
}

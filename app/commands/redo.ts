import { Command } from "./command.ts";

export class RedoCommand extends Command {
  name = "Redo";

  keys = [
    { name: "y", ctrl: true },
    { name: "y", super: true },
  ];

  async command(): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.history.redo();

    editor.render();
  }
}

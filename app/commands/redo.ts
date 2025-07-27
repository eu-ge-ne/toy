import { Command } from "./command.ts";

export class RedoCommand extends Command {
  override option = {
    name: "Redo",
    description: "Edit: Redo",
  };

  keys = [
    { name: "y", ctrl: true },
    { name: "y", super: true },
  ];

  async command(): Promise<Command | undefined> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.history.redo();

    editor.render();
  }
}

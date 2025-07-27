import { Command } from "./command.ts";

export class UndoCommand extends Command {
  override option = {
    name: "Undo",
    description: "Edit: Undo",
  };

  keys = [
    { name: "z", ctrl: true },
    { name: "z", super: true },
  ];

  async command(): Promise<Command | undefined> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.history.undo();

    editor.render();
  }
}

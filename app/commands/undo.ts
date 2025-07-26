import { Command } from "./command.ts";

export class UndoCommand extends Command {
  name = "Undo";

  keys = [
    { name: "z", ctrl: true },
    { name: "z", super: true },
  ];

  async command(): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.history.undo();

    editor.render();
  }
}

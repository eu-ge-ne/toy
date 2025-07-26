import { Command } from "./command.ts";

export class UndoCommand extends Command {
  keys = [
    { name: "z", ctrl: true },
    { name: "z", super: true },
  ];

  protected override async command(): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.history.undo();

    editor.render();
  }
}

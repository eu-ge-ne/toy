import { Command } from "./command.ts";

export class RedoCommand extends Command {
  keys = [
    { name: "y", ctrl: true },
    { name: "y", super: true },
  ];

  protected override async command(): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.history.redo();

    editor.render();
  }
}

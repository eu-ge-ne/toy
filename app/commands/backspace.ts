import { Command } from "./command.ts";

export class BackspaceCommand extends Command {
  keys = [
    { name: "BACKSPACE" },
  ];

  async command(): Promise<Command | undefined> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    if (editor.cursor.selecting) {
      editor.delete_selection();
    } else {
      editor.backspace();
    }

    editor.render();
  }
}

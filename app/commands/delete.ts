import { Command } from "./command.ts";

export class DeleteCommand extends Command {
  keys = [
    { name: "DELETE" },
  ];

  async command(): Promise<Command | undefined> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    if (editor.cursor.selecting) {
      editor.delete_selection();
    } else {
      editor.delete_char();
    }

    editor.render();
  }
}

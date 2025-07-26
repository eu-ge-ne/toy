import { Command } from "./command.ts";

export class DeleteCommand extends Command {
  keys = [
    { name: "DELETE" },
  ];

  protected override async command(): Promise<void> {
    const editor = this.app.focused_editor;
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

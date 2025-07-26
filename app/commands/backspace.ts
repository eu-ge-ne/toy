import { Command } from "./command.ts";

export class BackspaceCommand extends Command {
  keys = [
    { name: "BACKSPACE" },
  ];

  protected override async command(): Promise<void> {
    const editor = this.app.focused_editor;
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

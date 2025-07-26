import { Command } from "./command.ts";

export class BackspaceCommand extends Command {
  override name = "Backspace";

  keys = [
    { name: "BACKSPACE" },
  ];

  async command(): Promise<void> {
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

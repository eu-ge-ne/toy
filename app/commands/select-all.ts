import { Command } from "./command.ts";

export class SelectAllCommand extends Command {
  override option = {
    name: "Select All",
    description: "Edit: Select All",
  };

  keys = [
    { name: "a", ctrl: true },
    { name: "a", super: true },
  ];

  async command(): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor } = editor;

    cursor.move(-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, false);
    cursor.move(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);

    editor.render();
  }
}

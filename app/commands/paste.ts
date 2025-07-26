import { Command } from "./command.ts";

export class PasteCommand extends Command {
  keys = [
    { name: "v", ctrl: true },
    { name: "v", super: true },
  ];

  protected override async command(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.clipboard) {
      return;
    }

    editor.insert(editor.clipboard);

    editor.render();
  }
}

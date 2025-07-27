import { Command } from "./command.ts";

export class PasteCommand extends Command {
  override name = "Paste";

  keys = [
    { name: "v", ctrl: true },
    { name: "v", super: true },
  ];

  async command(): Promise<Command | undefined> {
    const editor = this.app.active_editor;
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

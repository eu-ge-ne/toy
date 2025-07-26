import { Command } from "./command.ts";

export class TabCommand extends Command {
  override name = "Tab";

  keys = [
    { name: "TAB" },
  ];

  async command(): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.opts.multi_line) {
      return;
    }

    editor.insert("\t");

    editor.render();
  }
}

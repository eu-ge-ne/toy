import { Command } from "./command.ts";

export class TabCommand extends Command {
  keys = [
    { name: "TAB" },
  ];

  async command(): Promise<Command | undefined> {
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

import { Command } from "./command.ts";

export class TabCommand extends Command {
  keys = [
    { name: "TAB" },
  ];

  protected override async command(): Promise<void> {
    const editor = this.app.focused_editor;
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

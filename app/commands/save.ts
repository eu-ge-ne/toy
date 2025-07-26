import { Command } from "./command.ts";

export class SaveCommand extends Command {
  keys = [
    { name: "F2" },
  ];

  protected override async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { editor } = this.app.ui;

    editor.enabled = false;

    await this.app.save();

    editor.enabled = true;

    editor.reset(false);
    editor.render();
  }
}

import { Command } from "./command.ts";

export class ExitCommand extends Command {
  keys = [
    { name: "F10" },
  ];

  protected override async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { changes, ui } = this.app;

    ui.editor.enabled = false;

    if (changes) {
      if (await ui.ask.open("Save changes?")) {
        await this.app.save();
      }
    }

    this.app.stop();
  }
}

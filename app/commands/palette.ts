import { Command } from "./command.ts";

export class PaletteCommand extends Command {
  keys = [
    { name: "F1" },
  ];

  protected override async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { editor, palette } = this.app.ui;

    editor.enabled = false;

    await palette.open();

    editor.enabled = true;

    editor.render();
  }
}

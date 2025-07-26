import { Command } from "./command.ts";

export class PaletteCommand extends Command {
  name = "Palette";

  keys = [
    { name: "F1" },
  ];

  async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { editor, palette } = this.app.ui;

    editor.enabled = false;

    await palette.open(this.app.commands);

    editor.enabled = true;

    editor.render();
  }
}

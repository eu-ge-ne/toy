import { Command } from "./command.ts";

export class PaletteCommand extends Command {
  keys = [
    { name: "F1" },
  ];

  async command(): Promise<void> {
    if (Command.started > 1) {
      return;
    }

    const { editor, palette } = this.app.ui;

    editor.enabled = false;

    const cmd = await palette.open(this.app.palette_options);

    editor.enabled = true;

    editor.render();
  }
}

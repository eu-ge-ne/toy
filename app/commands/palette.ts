import { Command } from "./command.ts";

export class PaletteCommand extends Command {
  keys = [
    { name: "F1" },
  ];

  async command(): Promise<Command | undefined> {
    if (Command.started > 1) {
      return;
    }

    const { editor, palette } = this.app.ui;

    editor.enabled = false;

    const option = await palette.open(this.app.options);

    editor.enabled = true;

    editor.render();

    if (option) {
      return this.app.commands.find((x) => x.name === option.name);
    }
  }
}

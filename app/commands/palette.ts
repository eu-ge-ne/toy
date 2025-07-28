import { Command } from "./command.ts";

export class PaletteCommand extends Command {
  keys = [
    { name: "F1" },
  ];

  async command(): Promise<void> {
    const { editor, palette } = this.app.ui;

    editor.enabled = false;

    const option = await palette.open(this.app.options);

    editor.enabled = true;

    editor.render();

    if (option) {
      await this.app.commands.find((x) => x.option?.name === option.name)
        ?.run();
    }
  }
}

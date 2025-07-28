import { Command } from "./command.ts";

export class PaletteCommand extends Command {
  match_keys = [
    { name: "F1" },
  ];

  option = undefined;

  async command(): Promise<void> {
    const { editor, palette } = this.app.ui;

    editor.enabled = false;

    const option = await palette.open(this.app.options);

    editor.enabled = true;

    editor.render();

    if (option) {
      await this.app.commands.find((x) => x.option?.id === option.id)?.run();
    }
  }
}

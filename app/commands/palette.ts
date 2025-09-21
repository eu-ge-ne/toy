import { Key } from "@lib/vt";

import { Command } from "./command.ts";

export class PaletteCommand extends Command {
  keys = [
    Key.create({ name: "F1" }),
    Key.create({ name: "F1", shift: true }),
    Key.create({ name: "F1", ctrl: true }),
    Key.create({ name: "F1", alt: true }),
    Key.create({ name: "F1", super: true }),
  ];

  option = undefined;

  async run(): Promise<void> {
    this.app.editor.enabled = false;

    const option = await this.app.palette.open();

    this.app.editor.enabled = true;

    this.app.editor.render();

    if (option) {
      await this.app.commands.find((x) => x.option?.id === option.id)?.run();
    }
  }
}

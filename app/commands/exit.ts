import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class ExitCommand extends Command {
  keys = [
    Key.create({ name: "F10" }),
  ];

  option = {
    id: "Exit",
    description: "Global: Exit",
    shortcuts: display_keys(this.keys),
  };

  async command(): Promise<void> {
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

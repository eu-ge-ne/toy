import { Key } from "@lib/vt";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class ExitCommand extends Command {
  keys = [
    Key.create({ name: "F10" }),
  ];

  option = new Option("Exit", "Global: Exit", this.keys);

  async run(): Promise<void> {
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

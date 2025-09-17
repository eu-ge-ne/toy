import { Key } from "@lib/vt";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class SaveCommand extends Command {
  keys = [
    Key.create({ name: "F2" }),
  ];

  option = new Option("Save", "Global: Save", this.keys);

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    editor.enabled = false;

    if (await this.app.save()) {
      editor.reset(false);
    }

    editor.enabled = true;

    editor.render();
  }
}

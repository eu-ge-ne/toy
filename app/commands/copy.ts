import { Key } from "@lib/vt";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class CopyCommand extends Command {
  keys = [];

  option = new Option(
    "Copy",
    "Edit: Copy",
    [
      Key.create({ name: "c", ctrl: true }),
      Key.create({ name: "c", super: true }),
    ],
  );

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "c", ctrl: true }));

      editor.render();
    }
  }
}

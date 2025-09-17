import { Key } from "@lib/vt";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class RedoCommand extends Command {
  keys = [];

  option = new Option(
    "Redo",
    "Edit: Redo",
    [
      Key.create({ name: "y", ctrl: true }),
      Key.create({ name: "y", super: true }),
    ],
  );

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "y", ctrl: true }));

      editor.render();
    }
  }
}

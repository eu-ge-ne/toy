import { Key } from "@lib/vt";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class UndoCommand extends Command {
  keys = [];

  option = new Option(
    "Undo",
    "Edit: Undo",
    [
      Key.create({ name: "z", ctrl: true }),
      Key.create({ name: "z", super: true }),
    ],
  );

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "z", ctrl: true }));

      editor.render();
    }
  }
}

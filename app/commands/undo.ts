import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class UndoCommand extends Command {
  keys = [];

  option = {
    id: "Undo",
    description: "Edit: Undo",
    shortcuts: display_keys([
      Key.create({ name: "z", ctrl: true }),
      Key.create({ name: "z", super: true }),
    ]),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "z", ctrl: true }));

      editor.render();
    }
  }
}

import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class RedoCommand extends Command {
  keys = [];

  option = {
    id: "Redo",
    description: "Edit: Redo",
    shortcuts: display_keys([
      Key.create({ name: "y", ctrl: true }),
      Key.create({ name: "y", super: true }),
    ]),
  };

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "y", ctrl: true }));

      editor.render();
    }
  }
}

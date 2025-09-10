import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class CopyCommand extends Command {
  keys = [];

  option = {
    id: "Copy",
    description: "Edit: Copy",
    shortcuts: display_keys([
      Key.create({ name: "c", ctrl: true }),
      Key.create({ name: "c", super: true }),
    ]),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "c", ctrl: true }));

      editor.render();
    }
  }
}

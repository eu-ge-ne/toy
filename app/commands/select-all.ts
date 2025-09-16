import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class SelectAllCommand extends Command {
  keys = [];

  option = {
    id: "Select All",
    description: "Edit: Select All",
    shortcuts: display_keys([
      Key.create({ name: "a", ctrl: true }),
      Key.create({ name: "a", super: true }),
    ]),
  };

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "a", ctrl: true }));

      editor.render();
    }
  }
}

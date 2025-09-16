import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class CutCommand extends Command {
  keys = [];

  option = {
    id: "Cut",
    description: "Edit: Cut",
    shortcuts: display_keys([
      Key.create({ name: "x", ctrl: true }),
      Key.create({ name: "x", super: true }),
    ]),
  };

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "x", ctrl: true }));

      editor.render();
    }
  }
}

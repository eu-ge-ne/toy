import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class PasteCommand extends Command {
  keys = [];

  option = {
    id: "Paste",
    description: "Edit: Paste",
    shortcuts: display_keys([
      Key.create({ name: "v", ctrl: true }),
      Key.create({ name: "v", super: true }),
    ]),
  };

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key(Key.create({ name: "v", ctrl: true }));

      editor.render();
    }
  }
}

import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class CopyCommand extends Command {
  match_keys = [];

  option = {
    id: "Copy",
    description: "Edit: Copy",
    shortcuts: display_keys([
      { name: "c", ctrl: true },
      { name: "c", super: true },
    ]),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_input({ name: "c", ctrl: true });

      editor.render();
    }
  }
}

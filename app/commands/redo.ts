import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class RedoCommand extends Command {
  match_keys = [];

  option = {
    id: "Redo",
    description: "Edit: Redo",
    shortcuts: display_keys([
      { name: "y", ctrl: true },
      { name: "y", super: true },
    ]),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key({ name: "y", ctrl: true });

      editor.render();
    }
  }
}

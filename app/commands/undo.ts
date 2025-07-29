import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class UndoCommand extends Command {
  match_keys = [];

  option = {
    id: "Undo",
    description: "Edit: Undo",
    shortcuts: display_keys([
      { name: "z", ctrl: true },
      { name: "z", super: true },
    ]),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key({ name: "z", ctrl: true });

      editor.render();
    }
  }
}

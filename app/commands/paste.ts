import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class PasteCommand extends Command {
  match_keys = [];

  option = {
    id: "Paste",
    description: "Edit: Paste",
    shortcuts: display_keys([
      { name: "v", ctrl: true },
      { name: "v", super: true },
    ]),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_input({ name: "v", ctrl: true });

      editor.render();
    }
  }
}

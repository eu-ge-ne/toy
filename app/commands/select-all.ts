import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class SelectAllCommand extends Command {
  match_keys = [];

  option = {
    id: "Select All",
    description: "Edit: Select All",
    shortcuts: display_keys([
      { name: "a", ctrl: true },
      { name: "a", super: true },
    ]),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_input({ name: "a", ctrl: true });

      editor.render();
    }
  }
}

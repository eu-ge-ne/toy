import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class CutCommand extends Command {
  match_keys = [];

  option = {
    id: "Cut",
    description: "Edit: Cut",
    shortcuts: display_keys([
      { name: "x", ctrl: true },
      { name: "x", super: true },
    ]),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    if (editor.enabled) {
      editor.handle_key({ name: "x", ctrl: true });

      editor.render();
    }
  }
}

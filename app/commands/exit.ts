import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class ExitCommand extends Command {
  match_keys = [
    { name: "F10" },
  ];

  option = {
    id: "Exit",
    description: "Global: Exit",
    shortcuts: display_keys(this.match_keys),
  };

  async command(): Promise<void> {
    const { changes, ui } = this.app;

    ui.editor.enabled = false;

    if (changes) {
      if (await ui.ask.open("Save changes?")) {
        await this.app.save();
      }
    }

    this.app.stop();
  }
}

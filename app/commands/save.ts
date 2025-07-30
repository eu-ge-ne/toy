import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class SaveCommand extends Command {
  match_keys = [
    { name: "F2" },
    { name: "F2", super: true },
  ];

  option = {
    id: "Save",
    description: "Global: Save",
    shortcuts: display_keys(this.match_keys),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    editor.enabled = false;

    await this.app.save();

    editor.enabled = true;

    editor.reset(false);
    editor.render();
  }
}

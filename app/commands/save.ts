import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class SaveCommand extends Command {
  match_keys = [
    { name: "F2" },
  ];

  option = {
    id: "Save",
    description: "Global: Save",
    shortcuts: display_keys(this.match_keys),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    editor.enabled = false;

    if (await this.app.save()) {
      editor.reset(false);
    }

    editor.enabled = true;

    editor.render();
  }
}

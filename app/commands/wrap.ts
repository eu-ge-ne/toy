import { display_keys } from "@lib/key";

import { Command } from "./command.ts";

export class WrapCommand extends Command {
  match_keys = [
    { name: "F6" },
  ];

  option = {
    id: "Wrap",
    description: "View: Toggle Line Wrap",
    shortcuts: display_keys(this.match_keys),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    editor.wrap_enabled = !editor.wrap_enabled;
    editor.cursor.move(0, -Number.MAX_SAFE_INTEGER, false);

    editor.render();
  }
}

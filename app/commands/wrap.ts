import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class WrapCommand extends Command {
  keys = [
    Key.create({ name: "F6" }),
  ];

  option = {
    id: "Wrap",
    description: "View: Toggle Line Wrap",
    shortcuts: display_keys(this.keys),
  };

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    editor.wrap_enabled = !editor.wrap_enabled;
    editor.cursor.home(false);

    editor.render();
  }
}

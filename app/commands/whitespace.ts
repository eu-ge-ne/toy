import { display_keys, Key } from "@lib/vt";

import { Command } from "./command.ts";

export class WhitespaceCommand extends Command {
  keys = [
    Key.create({ name: "F5" }),
  ];

  option = {
    id: "Whitespace",
    description: "View: Toggle Render Whitespace",
    shortcuts: display_keys(this.keys),
  };

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    editor.whitespace_enabled = !editor.whitespace_enabled;

    editor.render();
  }
}

import { display_keys } from "@lib/input";

import { Command } from "./command.ts";

export class WhitespaceCommand extends Command {
  match_keys = [
    { name: "F5" },
  ];

  option = {
    id: "Whitespace",
    description: "View: Toggle Render Whitespace",
    shortcuts: display_keys(this.match_keys),
  };

  async command(): Promise<void> {
    const { editor } = this.app.ui;

    editor.whitespace_enabled = !editor.whitespace_enabled;

    editor.render();
  }
}

import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export class WhitespaceCommand extends Command {
  keys = [
    Key.create({ name: "F5" }),
  ];

  match(key: Key): boolean {
    return key.name === "F5";
  }

  async run(): Promise<void> {
    this.app.editor.whitespace_enabled = !this.app.editor.whitespace_enabled;

    this.app.editor.render();
  }
}

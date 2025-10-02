import { Key } from "@lib/key";
import { PaletteOption } from "@ui/palette";

import { Command } from "./command.ts";

export class WhitespaceCommand extends Command {
  keys = [
    Key.create({ name: "F5" }),
  ];

  option = new PaletteOption(
    "Whitespace",
    "View: Toggle Render Whitespace",
    this.keys,
  );

  match(key: Key): boolean {
    return key.name === "F5";
  }

  async run(): Promise<void> {
    this.app.editor.whitespace_enabled = !this.app.editor.whitespace_enabled;

    this.app.editor.render();
  }
}

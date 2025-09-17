import { Key } from "@lib/vt";
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

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    editor.whitespace_enabled = !editor.whitespace_enabled;

    editor.render();
  }
}

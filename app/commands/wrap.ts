import { Key } from "@lib/vt";
import { Option } from "@ui/palette";

import { Command } from "./command.ts";

export class WrapCommand extends Command {
  keys = [
    Key.create({ name: "F6" }),
  ];

  option = new Option("Wrap", "View: Toggle Line Wrap", this.keys);

  async run(): Promise<void> {
    const { editor } = this.app.ui;

    editor.wrap_enabled = !editor.wrap_enabled;
    editor.cursor.home(false);

    editor.render();
  }
}

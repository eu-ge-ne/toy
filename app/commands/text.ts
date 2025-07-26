import { Key } from "@lib/input";

import { Command } from "./command.ts";

export class TextCommand extends Command {
  keys = [];

  override match(key: Key | string): boolean {
    return typeof key === "string" || typeof key.text === "string";
  }

  protected override async command(key: Key | string): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    const text = typeof key === "string" ? key : key.text!;

    editor.insert(text);

    editor.render();
  }
}

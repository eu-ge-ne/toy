import { copy_to_clipboard, write } from "@lib/vt";

import { Command } from "./command.ts";

export class CutCommand extends Command {
  keys = [
    { name: "x", ctrl: true },
    { name: "x", super: true },
  ];

  protected override async command(): Promise<void> {
    const editor = this.app.active_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor, buffer } = editor;

    if (cursor.selecting) {
      editor.clipboard = buffer.copy(cursor.from, cursor.to);

      editor.delete_selection();
    } else {
      editor.clipboard = buffer.copy([cursor.ln, cursor.col], [
        cursor.ln,
        cursor.col,
      ]);

      editor.delete_char();
    }

    write(copy_to_clipboard(editor.clipboard));

    editor.render();
  }
}

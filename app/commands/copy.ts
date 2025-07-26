import { copy_to_clipboard, write } from "@lib/vt";

import { Command } from "./command.ts";

export class CopyCommand extends Command {
  keys = [
    { name: "c", ctrl: true },
    { name: "c", super: true },
  ];

  protected override async command(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor, buffer } = editor;

    if (cursor.selecting) {
      editor.clipboard = buffer.copy(cursor.from, cursor.to);

      cursor.set(cursor.ln, cursor.col, false);
    } else {
      editor.clipboard = buffer.copy([cursor.ln, cursor.col], [
        cursor.ln,
        cursor.col,
      ]);
    }

    write(copy_to_clipboard(editor.clipboard));

    editor.render();
  }
}

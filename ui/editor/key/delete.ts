import { KeyHandler } from "./handler.ts";

export class Backspace extends KeyHandler {
  keys = [
    { name: "BACKSPACE" },
  ];

  handle(): void {
    const { cursor } = this.editor;

    if (cursor.selecting) {
      this.editor.delete_selection();
    } else {
      this.editor.backspace();
    }
  }
}

export class Delete extends KeyHandler {
  keys = [
    { name: "DELETE" },
  ];

  handle(): void {
    const { cursor } = this.editor;

    if (cursor.selecting) {
      this.editor.delete_selection();
    } else {
      this.editor.delete_char();
    }
  }
}

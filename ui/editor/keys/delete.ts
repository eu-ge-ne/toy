import { KeyHandler } from "./handler.ts";

export class DeleteHandler extends KeyHandler {
  keys = [
    { name: "DELETE" },
  ];

  handle(): void {
    if (this.editor.cursor.selecting) {
      this.editor.delete_selection();
    } else {
      this.editor.delete_char();
    }
  }
}

import { KeyHandler } from "./handler.ts";

export class BackspaceHandler extends KeyHandler {
  keys = [
    { name: "BACKSPACE" },
  ];

  handle(): boolean {
    if (this.editor.cursor.selecting) {
      this.editor.delete_selection();
    } else {
      this.editor.backspace();
    }

    return true;
  }
}

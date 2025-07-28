import { KeyHandler } from "./handler.ts";

export class UndoHandler extends KeyHandler {
  keys = [
    { name: "z", ctrl: true },
    { name: "z", super: true },
  ];

  handle(): void {
    this.editor.history.undo();
  }
}

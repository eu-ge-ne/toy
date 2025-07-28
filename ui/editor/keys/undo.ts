import { KeyHandler } from "./handler.ts";

export class UndoHandler extends KeyHandler {
  keys = [
    { name: "z", ctrl: true },
    { name: "z", super: true },
  ];

  handle(): boolean {
    return this.editor.history.undo();
  }
}

import { KeyHandler } from "./handler.ts";

export class Undo extends KeyHandler {
  keys = [
    { name: "z", ctrl: true },
    { name: "z", super: true },
  ];

  handle(): void {
    this.editor.history.undo();
  }
}

export class Redo extends KeyHandler {
  keys = [
    { name: "y", ctrl: true },
    { name: "y", super: true },
  ];

  handle(): void {
    this.editor.history.redo();
  }
}

import { KeyHandler } from "./handler.ts";

export class Undo extends KeyHandler {
  keys = [
    { name: "z", ctrl: true },
    { name: "z", super: true },
  ];

  handle(): void {
    this.editor.history.undo();

    this.editor.on_has_changes?.(this.editor.history.has_changes);
  }
}

export class Redo extends KeyHandler {
  keys = [
    { name: "y", ctrl: true },
    { name: "y", super: true },
  ];

  handle(): void {
    this.editor.history.redo();

    this.editor.on_has_changes?.(this.editor.history.has_changes);
  }
}

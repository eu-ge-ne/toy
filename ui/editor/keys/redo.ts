import { KeyHandler } from "./handler.ts";

export class RedoHandler extends KeyHandler {
  keys = [
    { name: "y", ctrl: true },
    { name: "y", super: true },
  ];

  handle(): boolean {
    return this.editor.history.redo();
  }
}

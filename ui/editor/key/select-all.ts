import { KeyHandler } from "./handler.ts";

export class SelectAll extends KeyHandler {
  keys = [
    { name: "a", ctrl: true },
    { name: "a", super: true },
  ];

  handle(): void {
    const { cursor } = this.editor;

    cursor.move(-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, false);
    cursor.move(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);
  }
}

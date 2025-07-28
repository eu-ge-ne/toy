import { KeyHandler } from "./handler.ts";

export class SelectAllHandler extends KeyHandler {
  keys = [
    { name: "a", ctrl: true },
    { name: "a", super: true },
  ];

  handle(): boolean {
    const { cursor } = this.editor;

    cursor.move(-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, false);
    cursor.move(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);

    return true;
  }
}

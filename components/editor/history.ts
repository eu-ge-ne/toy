import { Node, TextBuf } from "@lib/text-buf";

import { Cursor } from "./cursor.ts";

export class History {
  #index = -1;
  #entries: { ln: number; col: number; snapshot: Node }[] = [];

  onChange?: () => void;

  get isEmpty(): boolean {
    return this.#index === 0;
  }

  constructor(private buffer: TextBuf, private cursor: Cursor) {
    this.reset();
  }

  reset(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.buffer.save();

    this.#entries = [{ ln, col, snapshot }];
    this.#index = 0;

    this.onChange?.();
  }

  push(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.buffer.save();

    this.#index += 1;
    this.#entries[this.#index] = { ln, col, snapshot };
    this.#entries.length = this.#index + 1;

    this.onChange?.();
  }

  undo(): boolean {
    if (this.#index <= 0) {
      return false;
    }

    this.#index -= 1;
    this.#restore();
    this.onChange?.();

    return true;
  }

  redo(): boolean {
    if (this.#index >= (this.#entries.length - 1)) {
      return false;
    }

    this.#index += 1;
    this.#restore();
    this.onChange?.();

    return true;
  }

  #restore(): void {
    const { ln, col, snapshot } = this.#entries[this.#index]!;

    this.buffer.restore(snapshot);
    this.cursor.set(ln, col, false);
  }
}

import { Document, Node } from "@lib/document";

import { Cursor } from "./cursor.ts";

export class History {
  #index = 0;
  #entries: { ln: number; col: number; snapshot: Node }[] = [];

  onChange?: () => void;

  get changed(): boolean {
    return this.#index > 0;
  }

  constructor(
    private readonly document: Document,
    private readonly cursor: Cursor,
  ) {
    this.reset();
  }

  reset(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.document.save();

    this.#entries = [{ ln, col, snapshot }];
    this.#index = 0;

    this.#emitChange();
  }

  push(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.document.save();

    this.#index += 1;
    this.#entries[this.#index] = { ln, col, snapshot };
    this.#entries.length = this.#index + 1;

    this.#emitChange();
  }

  undo(): boolean {
    if (this.#index <= 0) {
      return false;
    }

    this.#index -= 1;
    this.#restore();
    this.#emitChange();

    return true;
  }

  redo(): boolean {
    if (this.#index >= (this.#entries.length - 1)) {
      return false;
    }

    this.#index += 1;
    this.#restore();
    this.#emitChange();

    return true;
  }

  #restore(): void {
    const { ln, col, snapshot } = this.#entries[this.#index]!;

    this.document.restore(snapshot);
    this.cursor.set(ln, col, false);
  }

  #emitChange(): void {
    this.onChange?.();
  }
}

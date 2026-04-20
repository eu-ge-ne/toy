import * as documents from "@libs/documents";

import { Cursor } from "./cursor.ts";

export class History {
  #index = 0;
  #entries: { ln: number; col: number; snapshot: documents.Node }[] = [];

  onChange?: () => void;

  get changed(): boolean {
    return this.#index > 0;
  }

  constructor(
    private readonly doc: documents.Document,
    private readonly cursor: Cursor,
  ) {
    this.reset();
  }

  reset(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.doc.save();

    this.#entries = [{ ln, col, snapshot }];
    this.#index = 0;

    this.#emitChange();
  }

  push(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.doc.save();

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

    this.doc.restore(snapshot);
    this.cursor.set(ln, col, false);
  }

  #emitChange(): void {
    this.onChange?.();
  }
}

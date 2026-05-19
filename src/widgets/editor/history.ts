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

    this.onChange?.();
  }

  push(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.doc.save();

    this.#index += 1;
    this.#entries[this.#index] = { ln, col, snapshot };
    this.#entries.length = this.#index + 1;

    this.onChange?.();
  }

  undo(): void {
    if (this.#index <= 0) {
      return;
    }

    this.#index -= 1;
    this.#restore();

    this.onChange?.();
  }

  redo(): void {
    if (this.#index >= (this.#entries.length - 1)) {
      return;
    }

    this.#index += 1;
    this.#restore();

    this.onChange?.();
  }

  #restore(): void {
    const { ln, col, snapshot } = this.#entries[this.#index]!;

    this.doc.restore(snapshot);
    this.cursor.set(ln, col, false);
  }
}

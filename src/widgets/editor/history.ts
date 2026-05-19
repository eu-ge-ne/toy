import * as documents from "@libs/documents";

import { Cursor } from "./cursor.ts";

export class History {
  #entries: { ln: number; col: number; snapshot: documents.Node }[] = [];
  #i = 0;

  onChange?: () => void;

  get changed(): boolean {
    return this.#i > 0;
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
    this.#i = 0;

    this.onChange?.();
  }

  push(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.doc.save();

    this.#i += 1;
    this.#entries[this.#i] = { ln, col, snapshot };
    this.#entries.length = this.#i + 1;

    this.onChange?.();
  }

  undo(): void {
    if (this.#i <= 0) {
      return;
    }

    this.#i -= 1;
    this.#restore();

    this.onChange?.();
  }

  redo(): void {
    if (this.#i >= (this.#entries.length - 1)) {
      return;
    }

    this.#i += 1;
    this.#restore();

    this.onChange?.();
  }

  #restore(): void {
    const { ln, col, snapshot } = this.#entries[this.#i]!;

    this.doc.restore(snapshot);
    this.cursor.set(ln, col, false);
  }
}

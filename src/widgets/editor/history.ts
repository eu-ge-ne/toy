import * as documents from "@libs/documents";

import { Cursor } from "./cursor.ts";

export class History {
  #entries: { ln: number; col: number }[] = [];
  #i!: number;

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
    this.doc.resetHistory();

    const { ln, col } = this.cursor;
    this.#entries = [{ ln, col }];
    this.#i = 0;

    this.onChange?.();
  }

  push(): void {
    this.doc.pushHistory();

    this.#i += 1;
    const { ln, col } = this.cursor;
    this.#entries[this.#i] = { ln, col };
    this.#entries.length = this.#i + 1;

    this.onChange?.();
  }

  undo(): void {
    this.doc.undoHistory();

    if (this.#i < 1) {
      return;
    }

    this.#i -= 1;
    const { ln, col } = this.#entries[this.#i]!;
    this.cursor.set(ln, col, false);

    this.onChange?.();
  }

  redo(): void {
    this.doc.redoHistory();

    if (this.#i >= (this.#entries.length - 1)) {
      return;
    }

    this.#i += 1;
    const { ln, col } = this.#entries[this.#i]!;
    this.cursor.set(ln, col, false);

    this.onChange?.();
  }
}

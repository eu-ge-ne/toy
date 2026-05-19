import * as documents from "@libs/documents";
import * as history from "@libs/history";

import { Cursor } from "./cursor.ts";

export class History {
  #docHistory = new history.History<documents.Node>();

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
    this.#docHistory.reset(this.doc.tree.root);

    const { ln, col } = this.cursor;
    this.#entries = [{ ln, col }];
    this.#i = 0;

    this.onChange?.();
  }

  push(): void {
    this.#docHistory.push(this.doc.tree.root);

    this.#i += 1;
    const { ln, col } = this.cursor;
    this.#entries[this.#i] = { ln, col };
    this.#entries.length = this.#i + 1;

    this.onChange?.();
  }

  undo(): void {
    const entry = this.#docHistory.undo();
    if (entry) {
      this.doc.tree.root = entry;
    }

    if (this.#i < 1) {
      return;
    }

    this.#i -= 1;
    const { ln, col } = this.#entries[this.#i]!;
    this.cursor.set(ln, col, false);

    this.onChange?.();
  }

  redo(): void {
    const entry = this.#docHistory.redo();
    if (entry) {
      this.doc.tree.root = entry;
    }

    if (this.#i >= (this.#entries.length - 1)) {
      return;
    }

    this.#i += 1;
    const { ln, col } = this.#entries[this.#i]!;
    this.cursor.set(ln, col, false);

    this.onChange?.();
  }
}

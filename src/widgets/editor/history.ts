import * as documents from "@libs/documents";
import * as history from "@libs/history";

import { Cursor } from "./cursor.ts";

export class History {
  #docHistory = new history.History<documents.Node>();
  #cursorHistory = new history.History<{ ln: number; col: number }>();

  get empty(): boolean {
    return this.#docHistory.empty;
  }

  constructor(
    private readonly doc: documents.Document,
    private readonly cursor: Cursor,
  ) {
    this.reset2();
  }

  reset2(): void {
    this.#docHistory.reset(this.doc.tree.root);

    const { ln, col } = this.cursor;
    this.#cursorHistory.reset({ ln, col });
  }

  push2(): void {
    this.#docHistory.push(this.doc.tree.root);

    const { ln, col } = this.cursor;
    this.#cursorHistory.push({ ln, col });
  }

  undo2(): void {
    const docEntry = this.#docHistory.undo();
    if (docEntry) {
      this.doc.tree.root = docEntry;
    }

    const cursorEntry = this.#cursorHistory.undo();
    if (cursorEntry) {
      this.cursor.set(cursorEntry.ln, cursorEntry.col, false);
    }
  }

  redo2(): void {
    const docEntry = this.#docHistory.redo();
    if (docEntry) {
      this.doc.tree.root = docEntry;
    }

    const cursorEntry = this.#cursorHistory.redo();
    if (cursorEntry) {
      this.cursor.set(cursorEntry.ln, cursorEntry.col, false);
    }
  }
}

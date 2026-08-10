import * as documents from "@libs/documents";

import { Cell, segments } from "./segmenter.ts";

export class Document {
  constructor(private readonly document: documents.Document) {
  }

  cells(ln: number, extra = false): IteratorObject<Cell> {
    const chunks = this.document.read2(ln, 0, ln + 1, 0);
    return segments(chunks, extra);
  }

  read(
    startLn: number,
    startCol: number,
    endLn: number,
    endCol: number,
  ): IteratorObject<string> {
    return this.document.read2(
      ...this.#unitPos(startLn, startCol),
      ...this.#unitPos(endLn, endCol),
    );
  }

  insert(ln: number, col: number, text: string): void {
    this.document.insert2(...this.#unitPos(ln, col), text);
  }

  delete(
    startLn: number,
    startCol: number,
    endLn: number,
    endCol: number,
  ): void {
    this.document.delete2(
      ...this.#unitPos(startLn, startCol),
      ...this.#unitPos(endLn, endCol),
    );
  }

  #unitPos(ln: number, col: number): [number, number] {
    let unit_col = 0;
    let i = 0;

    for (const { gr } of this.cells(ln)) {
      if (i === col) {
        break;
      }

      if (i < col) {
        unit_col += gr.char.length;
      }

      i += 1;
    }

    return [ln, unit_col];
  }
}

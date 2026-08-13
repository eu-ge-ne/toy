import { String2 } from "@libs/string2";

import { Cell, segments } from "./segmenter.ts";

export class Document {
  constructor(private readonly str: String2) {
  }

  cells(ln: number, extra = false): IteratorObject<Cell> {
    const chunks = this.str.read2(ln, 0, ln + 1, 0);
    return segments(chunks, extra);
  }

  read(
    startLn: number,
    startCol: number,
    endLn: number,
    endCol: number,
  ): IteratorObject<string> {
    return this.str.read2(
      ...this.#unitPos(startLn, startCol),
      ...this.#unitPos(endLn, endCol),
    );
  }

  insert(ln: number, col: number, text: string): void {
    this.str.insert2(...this.#unitPos(ln, col), text);
  }

  delete(
    startLn: number,
    startCol: number,
    endLn: number,
    endCol: number,
  ): void {
    this.str.delete2(
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

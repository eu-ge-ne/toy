import * as document from "@libs/document";

import { Segment, segments } from "./segmenter.ts";

interface Pos {
  ln: number;
  col: number;
}

export class Document {
  constructor(private readonly document: document.Document) {
  }

  line(ln: number, extra = false): IteratorObject<Segment> {
    const chunks = this.document.read2([ln, 0], [ln + 1, 0]);
    return segments(chunks, extra);
  }

  read(start: Pos, end: Pos): string {
    return this.document.read2(this.#unitPos(start), this.#unitPos(end))
      .reduce((a, x) => a + x, "");
  }

  insert(pos: Pos, text: string): void {
    this.document.insert2(this.#unitPos(pos), text);
  }

  delete(start: Pos, end: Pos): void {
    this.document.delete2(this.#unitPos(start), this.#unitPos(end));
  }

  #unitPos({ ln, col }: Pos): [number, number] {
    let unit_col = 0;
    let i = 0;

    for (const { gr } of this.line(ln)) {
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

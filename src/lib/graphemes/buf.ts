import * as chars from "@lib/chars";

import { Segment, segments } from "./segmenter.ts";

interface Pos {
  ln: number;
  col: number;
}

export class Buf {
  constructor(private readonly buf: chars.Buf) {
  }

  line(ln: number, extra = false): IteratorObject<Segment> {
    const chunks = this.buf.read2([ln, 0], [ln + 1, 0]);
    return segments(chunks, extra);
  }

  read(start: Pos, end: Pos): string {
    return this.buf.read2(this.#unitPos(start), this.#unitPos(end))
      .reduce((a, x) => a + x, "");
  }

  insert(pos: Pos, text: string): void {
    this.buf.insert2(this.#unitPos(pos), text);
  }

  delete(start: Pos, end: Pos): void {
    this.buf.delete2(this.#unitPos(start), this.#unitPos(end));
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

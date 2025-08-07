import { Buffer } from "@lib/buffer";
import { Grapheme, graphemes } from "@lib/grapheme";
import * as vt from "@lib/vt";

interface Cell {
  grapheme: Grapheme;
  i: number;
  ln: number;
  col: number;
}

export class Shaper {
  y!: number;
  x!: number;
  wrap_width!: number;

  constructor(private buffer: Buffer) {
  }

  *cells(ln: number, add_tail_cell: boolean): Generator<Cell> {
    const { buffer, wrap_width } = this;

    let i = 0;
    let w = 0;
    let l = 0;
    let c = 0;

    for (const seg of buffer.line(ln)) {
      const grapheme = graphemes.get(seg);

      if (grapheme.width < 0) {
        grapheme.width = vt.cursor.measure(this.y, this.x, grapheme.bytes);
      }

      w += grapheme.width;
      if (w > wrap_width) {
        w = grapheme.width;
        l += 1;
        c = 0;
      }

      yield { grapheme, i, ln: l, col: c };

      i += 1;
      c += 1;
    }

    if (add_tail_cell) {
      const grapheme = graphemes.get(" ");

      w += grapheme.width;
      if (w > wrap_width) {
        w = grapheme.width;
        l += 1;
        c = 0;
      }

      yield { grapheme, i, ln: l, col: c };
    }
  }

  cell(ln: number, col: number): Cell | undefined {
    return this.cells(ln, true).drop(col).next().value;
  }

  count_wraps(ln: number): number {
    return this.cells(ln, false)
      .reduce((a, { i, col }) => a + (i > 0 && col === 0 ? 1 : 0), 1);
  }
}

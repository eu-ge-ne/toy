import { Buffer } from "@lib/buffer";
import { Grapheme, GraphemePool } from "@lib/grapheme";
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

  constructor(
    private graphemes: GraphemePool,
    private buffer: Buffer,
  ) {
  }

  *line(ln: number): Generator<Grapheme> {
    for (const seg of this.buffer.line(ln)) {
      yield this.graphemes.get(seg);
    }
  }

  count_wraps(ln: number, wrap_width: number): number {
    return this.wrap_line(ln, wrap_width)
      .reduce((a, { i, col }) => a + (i > 0 && col === 0 ? 1 : 0), 1);
  }

  *wrap_line(
    ln: number,
    wrap_width = Number.MAX_SAFE_INTEGER,
    add_tail_cell = false,
  ): Generator<Cell> {
    const { buffer, graphemes } = this;

    let i = 0;
    let w = 0;
    let l = 0;
    let c = 0;

    for (const seg of buffer.line(ln)) {
      const grapheme = graphemes.get(seg);

      if (grapheme.width < 0) {
        vt.write(
          vt.cursor.set(this.y, this.x),
          grapheme.bytes,
        );

        grapheme.width = vt.cursor.get()[1] - this.x;
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
}

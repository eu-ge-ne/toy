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
  constructor(
    private graphemes: GraphemePool,
    private buffer: Buffer,
    private colors: Uint8Array,
  ) {
  }

  count_wraps(
    ln: number,
    wrap_width: number,
  ): number {
    return this.line(ln, wrap_width)
      .reduce((a, { col }) => a + (col === 0 ? 1 : 0), 0);
  }

  *line(
    ln: number,
    wrap_width = Number.MAX_SAFE_INTEGER,
    add_tail_cell = false,
  ): Generator<Cell> {
    const { buffer, graphemes, colors } = this;

    let i = 0;
    let w = 0;
    let l = 0;
    let c = 0;

    for (const seg of buffer.line(ln)) {
      const grapheme = graphemes.get(seg);

      if (grapheme.width < 0) {
        vt.end_write();
        grapheme.width = vt.width(colors, grapheme.bytes);
        vt.begin_write();
      }

      yield { grapheme, i, ln: l, col: c };

      i += 1;
      c += 1;
      w += grapheme.width;

      if (w >= wrap_width) {
        w = 0;
        l += 1;
        c = 0;
      }
    }

    if (add_tail_cell) {
      yield { grapheme: graphemes.get(" "), i, ln: l, col: c };
    }
  }
}

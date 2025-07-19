import { Buffer } from "@lib/buffer";
import { Grapheme, GraphemePool } from "@lib/grapheme";
import * as vt from "@lib/vt";

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
    return this.wrap_line(ln, wrap_width)
      .reduce((a, x) => a + (x.c === 0 ? 1 : 0), 0);
  }

  *wrap_line(
    ln: number,
    wrap_width = Number.MAX_SAFE_INTEGER,
  ): Generator<{ g: Grapheme; i: number; l: number; c: number }> {
    const { buffer, graphemes, colors } = this;

    let i = 0;
    let w = 0;
    let l = 0;
    let c = 0;

    for (const seg of buffer.line(ln)) {
      const g = graphemes.get(seg);

      if (g.width < 0) {
        vt.end_write();
        g.width = vt.width(colors, g.bytes);
        vt.begin_write();
      }

      yield { g, i, l, c };

      i += 1;
      c += 1;
      w += g.width;

      if (w >= wrap_width) {
        w = 0;
        l += 1;
        c = 0;
      }
    }
  }
}

import { Buf } from "@lib/buf";
import { Grapheme, GraphemePool } from "@lib/grapheme";
import * as vt from "@lib/vt";
import { VT_WIDTH_COLORS } from "@ui/theme";

export class Shaper {
  constructor(private graphemes: GraphemePool, private buf: Buf) {
  }

  *line(
    ln: number,
    width = Number.MAX_SAFE_INTEGER,
  ): Generator<{ g: Grapheme; i: number; l: number; c: number }> {
    const { buf, graphemes } = this;

    let i = 0;
    let w = 0;
    let l = 0;
    let c = 0;

    for (const seg of buf.line(ln)) {
      const g = graphemes.get(seg);

      if (g.width < 0) {
        vt.end_write();
        g.width = vt.width(VT_WIDTH_COLORS, g.bytes);
        vt.begin_write();
      }

      yield { g, i, l, c };

      i += 1;
      c += 1;
      w += g.width;

      if (w >= width) {
        w = 0;
        l += 1;
        c = 0;
      }
    }
  }
}

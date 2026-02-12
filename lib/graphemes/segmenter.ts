import * as vt from "@lib/vt";

import { Grapheme } from "./grapheme.ts";
import { graphemes } from "./graphemes.ts";

const sgr = new Intl.Segmenter();

export const settings = {
  width: Number.MAX_SAFE_INTEGER,
  y: 0,
  x: 0,
};

interface Segment {
  i: number;
  gr: Grapheme;
  ln: number;
  col: number;
}

export function* segments(
  chunks: IteratorObject<string>,
  extra = false,
): Generator<Segment> {
  const seg: Segment = {
    i: 0,
    gr: undefined as unknown as Grapheme,
    ln: 0,
    col: 0,
  };

  let w = 0;

  for (const chunk of chunks) {
    for (const { segment } of sgr.segment(chunk)) {
      seg.gr = graphemes.get(segment);

      if (seg.gr.width < 0) {
        seg.gr.width = vt.wchar(settings.y, settings.x, seg.gr.bytes);
      }

      w += seg.gr.width;
      if (w > settings.width) {
        w = seg.gr.width;
        seg.ln += 1;
        seg.col = 0;
      }

      yield seg;

      seg.i += 1;
      seg.col += 1;
    }
  }

  if (extra) {
    seg.gr = graphemes.get(" ");

    w += seg.gr.width;
    if (w > settings.width) {
      w = seg.gr.width;
      seg.ln += 1;
      seg.col = 0;
    }

    yield seg;
  }
}

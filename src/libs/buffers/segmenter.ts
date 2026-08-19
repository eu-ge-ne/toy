import * as graphemes from "@libs/graphemes";
import * as vt from "@libs/vt";

const sgr = new Intl.Segmenter();

export const settings = {
  width: Number.MAX_SAFE_INTEGER,
  y: 0,
  x: 0,
};

export interface Cell {
  i: number;
  gr: graphemes.Grapheme;
  ln: number;
  col: number;
}

export function measure(text: string): { lns: number; cols: number } {
  let lns = 0;
  let cols = 0;

  for (const { segment } of sgr.segment(text)) {
    const gr = graphemes.graphemes.get(segment);

    if (gr.width < 0) {
      gr.width = vt.wchar(settings.y, settings.x, gr.bytes);
    }

    if (gr.isEol) {
      lns += 1;
      cols = 0;
    } else {
      cols += 1;
    }
  }

  return { lns, cols };
}

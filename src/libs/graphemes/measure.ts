import { graphemes } from "./graphemes.ts";

const sgr = new Intl.Segmenter();

export function measure(text: string): { lns: number; cols: number } {
  let lns = 0;
  let cols = 0;

  for (const { segment } of sgr.segment(text)) {
    const grm = graphemes.get(segment);

    if (grm.isEol) {
      lns += 1;
      cols = 0;
    } else {
      cols += 1;
    }
  }

  return { lns, cols };
}

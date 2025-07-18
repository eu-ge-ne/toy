import { EOL_RE, Grapheme } from "./grapheme.ts";
import { GraphemePool } from "./pool.ts";

export class GraphemeSegmenter {
  #segmenter = new Intl.Segmenter();

  constructor(private pool: GraphemePool) {
  }

  *graphemes(text: string): Generator<Grapheme> {
    for (const { segment } of this.#segmenter.segment(text)) {
      yield this.pool.grapheme(segment);
    }
  }

  count_graphemes(text: string): number {
    return [...this.#segmenter.segment(text)].length;
  }

  measure(text: string): [number, number] {
    const eols = text.matchAll(EOL_RE).toArray();

    if (eols.length === 0) {
      return [0, this.count_graphemes(text)];
    } else {
      const eol = eols.at(-1)!;
      const last_line = text.slice(eol.index + eol[0].length);

      return [eols.length, this.count_graphemes(last_line)];
    }
  }

  unit_index(text: string, grapheme_index: number): number {
    let unit_index = 0;

    let i = 0;
    for (const { segment } of this.#segmenter.segment(text)) {
      if (i === grapheme_index) {
        break;
      }

      if (i < grapheme_index) {
        unit_index += segment.length;
      }

      i += 1;
    }

    return unit_index;
  }
}

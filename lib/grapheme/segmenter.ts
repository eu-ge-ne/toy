import { EOL_RE, Grapheme } from "./grapheme.ts";

interface GraphemeSegmenterOptions {
  overrides?: Map<string, string>;
}

export class GraphemeSegmenter {
  #segmenter = new Intl.Segmenter();
  #pool = new Map<string, Grapheme>();

  constructor({ overrides }: GraphemeSegmenterOptions = {}) {
    if (overrides) {
      for (const [seg, override] of overrides) {
        this.#pool.set(seg, new Grapheme(seg, override));
      }
    }
  }

  *graphemes(text: string): Generator<Grapheme> {
    for (const { segment } of this.#segmenter.segment(text)) {
      yield this.#get(segment);
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

  #get(seg: string): Grapheme {
    let grapheme = this.#pool.get(seg);

    if (!grapheme) {
      grapheme = new Grapheme(seg);

      // Printable ASCII excluding DEL(0x7f) ?
      if ([...seg].length === 1) {
        const cp = seg.codePointAt(0);
        if (typeof cp === "number" && cp >= 0x20 && cp < 0x7f) {
          grapheme.width = 1;
        }
      }

      this.#pool.set(seg, grapheme);
    }

    return grapheme;
  }
}

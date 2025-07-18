import { Grapheme } from "./grapheme.ts";

interface GraphemePoolOptions {
  overrides?: Map<string, string>;
}

export class GraphemePool {
  #pool = new Map<string, Grapheme>();

  constructor({ overrides }: GraphemePoolOptions = {}) {
    if (overrides) {
      for (const [seg, override] of overrides) {
        this.#pool.set(seg, new Grapheme(seg, override));
      }
    }
  }

  grapheme(seg: string): Grapheme {
    let grapheme = this.#pool.get(seg);

    if (!grapheme) {
      grapheme = new Grapheme(seg);

      // Printable ASCII excluding DEL(0x7f) ?
      if ([...seg].length === 1) {
        const cp = seg.codePointAt(0);
        if (typeof cp === "number" && cp >= 0x20 && cp < 0x7f) {
          grapheme.vt_width = 1;
        }
      }

      this.#pool.set(seg, grapheme);
    }

    return grapheme;
  }
}

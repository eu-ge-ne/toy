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

  get(seg: string): Grapheme {
    let grapheme = this.#pool.get(seg);

    if (!grapheme) {
      grapheme = new Grapheme(seg);

      this.#pool.set(seg, grapheme);
    }

    return grapheme;
  }
}

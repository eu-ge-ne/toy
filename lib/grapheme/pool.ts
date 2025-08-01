import { Grapheme } from "./grapheme.ts";

export class GraphemePool {
  #pool = new Map<string, Grapheme>();

  constructor(overrides: Record<string, [string, number]>) {
    for (const [seg, [override, width]] of Object.entries(overrides)) {
      this.#pool.set(seg, new Grapheme(seg, width, override));
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

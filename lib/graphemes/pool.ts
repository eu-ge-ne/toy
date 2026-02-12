import { Grapheme } from "./grapheme.ts";

export class GraphemePool {
  #encoder = new TextEncoder();
  #pool = new Map<string, Grapheme>();

  constructor(pool: Record<string, [string, number]>) {
    for (const [seg, [b, w]] of Object.entries(pool)) {
      const g = new Grapheme(seg, this.#encoder.encode(b), w);
      this.#pool.set(seg, g);
    }
  }

  get(seg: string): Grapheme {
    let g = this.#pool.get(seg);

    if (!g) {
      g = new Grapheme(seg, this.#encoder.encode(seg), -1);
      this.#pool.set(seg, g);
    }

    return g;
  }
}

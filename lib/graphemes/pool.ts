import { Grapheme } from "./grapheme.ts";

const enc = new TextEncoder();

export class GraphemePool {
  #pool = new Map<string, Grapheme>();

  constructor(pool: Record<string, [string, number]>) {
    for (const [seg, [b, w]] of Object.entries(pool)) {
      const gr = new Grapheme(seg, enc.encode(b), w);

      this.#pool.set(seg, gr);
    }
  }

  get(char: string): Grapheme {
    let gr = this.#pool.get(char);

    if (!gr) {
      gr = new Grapheme(char, enc.encode(char), -1);

      this.#pool.set(char, gr);
    }

    return gr;
  }
}

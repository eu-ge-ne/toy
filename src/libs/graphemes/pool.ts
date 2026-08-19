import * as vt from "@libs/vt";

import { Grapheme } from "./grapheme.ts";

const enc = new TextEncoder();

export class Pool {
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
      const bytes = enc.encode(char);
      const width = vt.wchar(bytes);

      gr = new Grapheme(char, bytes, width);

      this.#pool.set(char, gr);
    }

    return gr;
  }
}

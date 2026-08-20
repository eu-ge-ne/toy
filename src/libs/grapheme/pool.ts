import { range } from "@libs/std";
import * as vt from "@libs/vt";

import { Grapheme } from "./grapheme.ts";

const enc = new TextEncoder();

class Pool {
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

export const pool = new Pool({
  "\u0000": ["␀", 1],
  "\u0001": ["␁", 1],
  "\u0002": ["␂", 1],
  "\u0003": ["␃", 1],
  "\u0004": ["␄", 1],
  "\u0005": ["␅", 1],
  "\u0006": ["␆", 1],
  "\u0007": ["␇", 1],
  "\u0008": ["␈", 1],
  "\u0009": ["\u2022\u2022\u2022\u2022", 4], // "␉"
  "\u000a": ["␊", 1],
  "\u000b": ["␋", 1],
  "\u000c": ["␌", 1],
  "\u000d": ["␍", 1],
  "\u000e": ["␎", 1],
  "\u000f": ["␏", 1],
  "\u0010": ["␐", 1],
  "\u0011": ["␑", 1],
  "\u0012": ["␒", 1],
  "\u0013": ["␓", 1],
  "\u0014": ["␔", 1],
  "\u0015": ["␕", 1],
  "\u0016": ["␖", 1],
  "\u0017": ["␗", 1],
  "\u0018": ["␘", 1],
  "\u0019": ["␙", 1],
  "\u001a": ["␚", 1],
  "\u001b": ["␛", 1],
  "\u001c": ["␜", 1],
  "\u001d": ["␝", 1],
  "\u001e": ["␞", 1],
  "\u001f": ["␟", 1],
  "\u0020": ["\u2027", 1], // "␠"
  ...Object.fromEntries(
    range(0x21, 0x7f).map(
      (i) => [String.fromCharCode(i), [String.fromCharCode(i), 1]],
    ),
  ),
  "\u007f": ["␡", 1],
  "\r\n": ["␍␊", 2],
});

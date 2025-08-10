import { CSI } from "./ansi.ts";

import { write } from "./write.ts";

const bsu_bytes = CSI("?2026h");
const esu_bytes = CSI("?2026l");

let c = 0;

export function bsu(): void {
  if (c === 0) {
    write(bsu_bytes);
  }

  c += 1;
}

export function esu(): void {
  c -= 1;

  if (c === 0) {
    write(esu_bytes);
  }
}

import { DECResetMode, decrst, decset, DECSetMode } from "@eu-ge-ne/ctlseqs";

import { write_direct } from "./write.ts";

const bsu_bytes = decset(DECSetMode.BSU);
const esu_bytes = decrst(DECResetMode.ESU);

let c = 0;

export function bsu(): void {
  if (c === 0) {
    write_direct(bsu_bytes);
  }

  c += 1;
}

export function esu(): void {
  c -= 1;

  if (c === 0) {
    write_direct(esu_bytes);
  }
}

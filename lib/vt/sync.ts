import { DECResetMode, decrst, decset, DECSetMode } from "@eu-ge-ne/ctlseqs";

import { write } from "./write.ts";

const bsu = decset(DECSetMode.BSU);
const esu = decrst(DECResetMode.ESU);

let stack = 0;

export function begin_sync(): void {
  if (stack === 0) {
    write(bsu);
  }

  stack += 1;
}

export function end_sync(): void {
  stack -= 1;

  if (stack === 0) {
    write(esu);
  }
}

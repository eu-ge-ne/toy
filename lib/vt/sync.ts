import { DECResetMode, decrst, decset, DECSetMode } from "@eu-ge-ne/ctlseqs";

import { flush, write } from "./write.ts";

const bsu = decset(DECSetMode.BSU);
const esu = decrst(DECResetMode.ESU);

export function begin_write(...chunks: Uint8Array[]): void {
  write(bsu, ...chunks);
}

export function end_write(...chunks: Uint8Array[]): void {
  flush(...chunks, esu);
}

export function sync_write(...chunks: Uint8Array[]): void {
  flush(bsu, ...chunks, esu);
}

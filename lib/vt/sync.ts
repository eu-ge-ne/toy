import { DECResetMode, decrst, decset, DECSetMode } from "@eu-ge-ne/ctlseqs";

import { direct_write } from "./write.ts";

export const bsu = decset(DECSetMode.BSU);
export const esu = decrst(DECResetMode.ESU);

const buf = new ArrayBuffer(1024 * 64, { maxByteLength: 1024 * 1024 * 64 });
const bytes = new Uint8Array(buf);

let i = 0;
let c = 0;

export function begin_sync_write(...chunks: Uint8Array[]): void {
  c += 1;
  sync_write(...chunks);
}

export function sync_write(...chunks: Uint8Array[]): void {
  for (const chunk of chunks) {
    const j = i + chunk.byteLength;
    if (j > buf.byteLength) {
      buf.resize(j * 2);
    }

    bytes.set(chunk, i);
    i = j;
  }
}

export function end_sync_write(...chunks: Uint8Array[]): void {
  sync_write(...chunks);
  c -= 1;

  if (c === 0) {
    direct_write(bsu, bytes.subarray(0, i), esu);
    i = 0;
  }
}

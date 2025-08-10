import { CSI } from "./ansi.ts";

const ech_cache: Record<number, Uint8Array> = {};

export function ech(n: number): Uint8Array {
  let bytes = ech_cache[n];

  if (!bytes) {
    bytes = ech_cache[n] = CSI(`${n}X`);
  }

  return bytes;
}

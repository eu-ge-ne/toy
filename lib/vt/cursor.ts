import { cpr_req, decrc, decsc, parse_cpr_res } from "@eu-ge-ne/ctlseqs";

import { csi } from "./csi.ts";
import { write } from "./write.ts";

export const save = decsc;
export const restore = decrc;

export const hide = csi("?25l");
export const show = csi("?25h");

const set_cache: Record<number, Record<number, Uint8Array>> = {};

export function set(y: number, x: number): Uint8Array {
  let bytes = set_cache[y]?.[x];

  if (!bytes) {
    bytes = csi(`${y + 1};${x + 1}H`);

    if (!set_cache[y]) {
      set_cache[y] = { [x]: bytes };
    } else {
      set_cache[y][x] = bytes;
    }
  }

  return bytes;
}

const buf = new Uint8Array(1024);

export function measure(y: number, x: number, bytes: Uint8Array): number {
  write(
    set(y, x),
    bytes,
    cpr_req,
  );

  for (let i = 0; i < 4; i += 1) {
    const len = Deno.stdin.readSync(buf)!;
    if (len) {
      const pos = parse_cpr_res(buf.subarray(0, len));
      if (pos) {
        return pos[1] - 1 - x;
      }
    }
  }

  throw new Error("cursor.get(): timeout");
}

import {
  cpr_req,
  cup,
  decrc,
  DECResetMode,
  decrst,
  decsc,
  decset,
  DECSetMode,
  parse_cpr_res,
} from "@eu-ge-ne/ctlseqs";

import { write } from "./write.ts";

export const save = decsc;
export const restore = decrc;

export const hide = decrst(DECResetMode.DECTCEM);
export const show = decset(DECSetMode.DECTCEM);

export function set(y: number, x: number): Uint8Array {
  return cup(y + 1, x + 1);
}

const buf = new Uint8Array(1024);

export function get(): [number, number] {
  write(cpr_req);

  for (let i = 0; i < 4; i += 1) {
    const len = Deno.stdin.readSync(buf)!;

    if (len) {
      const pos = parse_cpr_res(buf.subarray(0, len));

      if (pos) {
        return [pos[0] - 1, pos[1] - 1];
      }
    }
  }

  throw new Error("cursor.get(): timeout");
}

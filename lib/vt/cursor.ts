import { CSI, ESC } from "./ansi.ts";
import { write } from "./write.ts";

export const save = ESC("7");
export const restore = ESC("8");

export const hide = CSI("?25l");
export const show = CSI("?25h");

const set_cache: Record<number, Record<number, Uint8Array>> = {};

export function set(y: number, x: number): Uint8Array {
  let bytes = set_cache[y]?.[x];

  if (!bytes) {
    bytes = CSI(`${y + 1};${x + 1}H`);

    if (!set_cache[y]) {
      set_cache[y] = { [x]: bytes };
    } else {
      set_cache[y][x] = bytes;
    }
  }

  return bytes;
}

export const cpr_req = CSI("6n");

const cpr_buf = new Uint8Array(1024);
const decoder = new TextDecoder();

export function measure(y: number, x: number, bytes: Uint8Array): number {
  write(
    set(y, x),
    bytes,
    cpr_req,
  );

  for (let i = 0; i < 4; i += 1) {
    const len = Deno.stdin.readSync(cpr_buf);
    if (!len) {
      continue;
    }

    const bytes = cpr_buf.subarray(0, len);

    const match = decoder.decode(bytes).match(/\x1b\[\d+;(\d+)R/);
    if (!match) {
      continue;
    }

    return Number.parseInt(match[1]!) - 1 - x;
  }

  throw new Error("cursor.measure(): timeout");
}

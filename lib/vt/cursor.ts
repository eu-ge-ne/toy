import { sync } from "./sync.ts";
import { Writer } from "./writer.ts";

const enc = new TextEncoder();

export const save = enc.encode("\x1b7");
export const restore = enc.encode("\x1b8");

export const hide = enc.encode("\x1b[?25l");
export const show = enc.encode("\x1b[?25h");

export const down = enc.encode("\x1b[B");

const set_cache: Record<number, Record<number, Uint8Array>> = {};

export function set(out: Writer, y: number, x: number): void {
  let bytes = set_cache[y]?.[x];

  if (!bytes) {
    bytes = enc.encode(`\x1b[${y + 1};${x + 1}H`);

    if (!set_cache[y]) {
      set_cache[y] = { [x]: bytes };
    } else {
      set_cache[y][x] = bytes;
    }
  }

  out.write(bytes);
}

export const cpr_req = enc.encode("\x1b[6n");

const cpr_buf = new Uint8Array(1024);
const decoder = new TextDecoder();

export function measure(y: number, x: number, bytes: Uint8Array): number {
  set(sync, y, x);
  sync.write(bytes);
  sync.write(cpr_req);

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

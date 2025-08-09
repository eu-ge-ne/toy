import { CSI } from "./ansi.ts";
import * as cursor from "./cursor.ts";

const cud = CSI("B");

const ech_cache: Record<number, Uint8Array> = {};

function ech(n: number): Uint8Array {
  let bytes = ech_cache[n];

  if (!bytes) {
    bytes = ech_cache[n] = CSI(`${n}X`);
  }

  return bytes;
}

export function clear_line(w: number): Uint8Array {
  return ech(w);
}

interface ClearAreaParams {
  y: number;
  x: number;
  w: number;
  h: number;
}

export function* clear_area(
  { y, x, w, h }: ClearAreaParams,
): Generator<Uint8Array> {
  yield cursor.set(y, x);

  for (let i = h; i > 0; i -= 1) {
    yield ech(w);
    yield cud;
  }
}

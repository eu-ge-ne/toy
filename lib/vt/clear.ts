import { cud1, ech } from "@eu-ge-ne/ctlseqs";

import * as cursor from "./cursor.ts";

export function clear_line(w: number): Uint8Array {
  return ech(w);
}

interface ClearParams {
  y: number;
  x: number;
  w: number;
  h: number;
}

export function* clear_area(
  { y, x, w, h }: ClearParams,
): Generator<Uint8Array> {
  yield cursor.set(y, x);

  for (let i = h; i > 0; i -= 1) {
    yield ech(w);

    yield cud1;
  }
}

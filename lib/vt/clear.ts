import { cud1, ech } from "@eu-ge-ne/ctlseqs";

import * as cursor from "./cursor.ts";

export function* clear(
  y: number,
  x: number,
  h: number,
  w: number,
): Generator<Uint8Array> {
  yield cursor.set(y, x);

  for (let i = h; i > 0; i -= 1) {
    yield ech(w);

    yield cud1;
  }
}

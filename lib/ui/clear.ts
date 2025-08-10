import { cursor, ech } from "@lib/vt";

import { Area } from "./area.ts";

export function* area({ y, x, w, h }: Area): Generator<Uint8Array> {
  yield cursor.set(y, x);

  for (let i = h; i > 0; i -= 1) {
    yield ech(w);

    yield cursor.down;
  }
}

export function line(w: number): Uint8Array {
  return ech(w);
}

import { cursor, ech } from "@lib/vt";

export interface Area {
  y: number;
  x: number;
  w: number;
  h: number;
}

export function* clear_area({ y, x, w, h }: Area): Generator<Uint8Array> {
  yield cursor.set(y, x);

  for (let i = h; i > 0; i -= 1) {
    yield ech(w);

    yield cursor.down;
  }
}

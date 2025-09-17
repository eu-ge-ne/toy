import { cursor, ech } from "@lib/vt";

export function* clear_area(
  { y, x, w, h }: { y: number; x: number; w: number; h: number },
): Generator<Uint8Array> {
  yield cursor.set(y, x);

  for (let i = h; i > 0; i -= 1) {
    yield ech(w);

    yield cursor.down;
  }
}

export function clear_line(w: number): Uint8Array {
  return ech(w);
}

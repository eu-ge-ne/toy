import { csi, csi_cached } from "./ansi.ts";
import * as cursor from "./cursor.ts";

const ech = (n: number) => csi_cached(n, () => `${n}X`);
const cud = csi("B");

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

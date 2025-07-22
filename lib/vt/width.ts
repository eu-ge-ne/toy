import * as cursor from "./cursor.ts";
import { flush } from "./write.ts";

export function width(y: number, x: number, bytes: Uint8Array): number {
  const pos = cursor.get();

  flush(
    cursor.set(y, x),
    bytes,
  );

  const [, w] = cursor.get();

  flush(cursor.set(...pos));

  return w;
}

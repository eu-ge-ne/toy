import * as cursor from "./cursor.ts";
import { flush } from "./write.ts";

export function width(...bytes: Uint8Array[]): number {
  const pos = cursor.get();

  flush(
    cursor.hide,
    cursor.set(0, 0),
    ...bytes,
  );
  const [, x] = cursor.get();

  flush(cursor.set(...pos));

  return x;
}

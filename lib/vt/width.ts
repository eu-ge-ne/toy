import { get, restore, save, set } from "./cursor.ts";
import { flush } from "./write.ts";

export function width(y: number, x: number, bytes: Uint8Array): number {
  flush(
    save,
    set(y, x),
    bytes,
  );

  const [, w] = get();

  flush(restore);

  return w;
}

import { get_cursor, hide_cursor, set_cursor } from "./cursor.ts";
import { flush } from "./write.ts";

export function vt_width(...bytes: Uint8Array[]): number {
  const pos = get_cursor();

  flush(hide_cursor, set_cursor(0, 0), ...bytes);
  const [, x] = get_cursor();

  flush(set_cursor(...pos));

  return x;
}

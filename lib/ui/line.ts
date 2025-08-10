import { ech } from "@lib/vt";

export function clear_line(w: number): Uint8Array {
  return ech(w);
}

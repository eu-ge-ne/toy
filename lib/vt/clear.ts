import * as cursor from "./cursor.ts";
import { ech } from "./ech.ts";
import { Writer } from "./writer.ts";

export function clear_area(
  out: Writer,
  { y, x, w, h }: { y: number; x: number; w: number; h: number },
): void {
  cursor.set(out, y, x);

  for (let i = h; i > 0; i -= 1) {
    ech(out, w);

    out.write(cursor.down);
  }
}

export function clear_line(out: Writer, w: number): void {
  ech(out, w);
}

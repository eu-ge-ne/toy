import { CSI, ESC } from "./ansi.ts";
import { Writer } from "./writer.ts";

export const save = ESC("7");
export const restore = ESC("8");

export const hide = CSI("?25l");
export const show = CSI("?25h");

export const down = CSI("B");

const cache: Record<number, Record<number, Uint8Array>> = {};

export function set(out: Writer, y: number, x: number): void {
  let bytes = cache[y]?.[x];

  if (!bytes) {
    bytes = CSI(`${y + 1};${x + 1}H`);

    if (!cache[y]) {
      cache[y] = { [x]: bytes };
    } else {
      cache[y][x] = bytes;
    }
  }

  out.write(bytes);
}

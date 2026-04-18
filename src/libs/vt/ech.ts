import { CSI } from "./ansi.ts";
import { Writer } from "./writer.ts";

const cache: Record<number, Uint8Array> = {};

export function ech(out: Writer, n: number): void {
  let bytes = cache[n];

  if (!bytes) {
    bytes = cache[n] = CSI(`${n}X`);
  }

  out.write(bytes);
}

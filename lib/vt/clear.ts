import { ech } from "./ech.ts";
import { Writer } from "./writer.ts";

export function clear_line(out: Writer, w: number): void {
  ech(out, w);
}

import { ech } from "./ech.ts";
import { Writer } from "./writer.ts";

export function clearLine(out: Writer, w: number): void {
  ech(out, w);
}

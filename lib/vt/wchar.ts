import { CSI } from "./ansi.ts";
import { set } from "./cursor.ts";
import { readRegExp } from "./read.ts";
import { sync } from "./writer.ts";

export const cpr_req = CSI("6n");

export function wchar(y: number, x: number, bytes: Uint8Array): number {
  set(sync, y, x);
  sync.write(bytes);
  sync.write(cpr_req);

  const match = readRegExp(/\x1b\[\d+;(\d+)R/);

  const x1 = Number.parseInt(match[1]!);
  if (!Number.isSafeInteger(x1)) {
    throw new Error("wchar error");
  }

  return x1 - 1 - x;
}

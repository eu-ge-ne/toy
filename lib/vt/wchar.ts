import { CSI } from "./ansi.ts";
import { set } from "./cursor.ts";
import { readSync } from "./read.ts";
import { sync } from "./writer.ts";

export const cprReq = CSI("6n");

const dec = new TextDecoder();

export function wchar(y: number, x: number, bytes: Uint8Array): number {
  set(sync, y, x);
  sync.write(bytes);
  sync.write(cprReq);

  const x1 = readSync((data) => {
    const match = dec.decode(data).match(/\x1b\[\d+;(\d+)R/);
    if (!match) {
      return undefined;
    }
    const x = Number.parseInt(match[1]!);
    const n = match.index! + match[0].length;
    return [x, n];
  });

  return x1 - 1 - x;
}

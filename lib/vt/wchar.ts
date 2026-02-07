import { CSI } from "./ansi.ts";
import { set } from "./cursor.ts";
import { sync } from "./writer.ts";

export const cpr_req = CSI("6n");

const dec = new TextDecoder();
const buf = new Uint8Array(1024);

export function wchar(y: number, x: number, bytes: Uint8Array): number {
  set(sync, y, x);
  sync.write(bytes);
  sync.write(cpr_req);

  const t0 = Date.now();

  while (true) {
    const len = Deno.stdin.readSync(buf);
    if (!len) {
      throw new Error("wchar error");
    }

    const match = dec.decode(buf.subarray(0, len)).match(/\x1b\[\d+;(\d+)R/);
    if (match) {
      const x1 = Number.parseInt(match[1]!);
      if (!Number.isSafeInteger(x1)) {
        throw new Error("wchar error");
      }
      return x1 - 1 - x;
    }

    if (Date.now() - t0 > 10) {
      throw new Error("wchar error");
    }
  }
}

import { CSI } from "./ansi.ts";
import { set } from "./cursor.ts";
import { readSync } from "./read.ts";
import { sync } from "./writer.ts";

export const cprReq = CSI("6n"); // Reply: CSI 1 ; 6 R

const dec = new TextDecoder();

export function wchar(y: number, x: number, bytes: Uint8Array): number {
  set(sync, y, x);
  sync.write(bytes);
  sync.write(cprReq);

  const x1 = readSync((data) => {
    let i = 0;

    // CSI
    let j0 = -1;
    for (; i < data.byteLength; i += 1) {
      if (data[i] === 0x1b) {
        j0 = i;
        break;
      }
    }
    if (j0 === -1) {
      return undefined;
    }
    i += 1;
    if (data[i] !== 0x5b) {
      return undefined;
    }

    // ;
    i += 1;
    let j1 = -1;
    for (; i < data.byteLength; i += 1) {
      if (data[i] === 0x3b) {
        j1 = i;
        break;
      }
    }
    if (j1 === -1) {
      return undefined;
    }

    // R
    i += 1;
    let j2 = -1;
    for (; i < data.byteLength; i += 1) {
      if (data[i] === 0x52) {
        j2 = i;
        break;
      }
    }
    if (j2 === -1) {
      return undefined;
    }

    const col = dec.decode(data.subarray(j1 + 1, j2));

    return [Number.parseInt(col), j2 + 1];
  });

  return x1 - 1 - x;
}

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
    // CSI
    let iStart = -1;
    for (let i = 0; i < data.byteLength; i += 1) {
      if (data[i] === 0x1b) {
        iStart = i;
        break;
      }
    }
    if (iStart === -1) {
      return undefined;
    }
    iStart += 1;
    if (data[iStart] !== 0x5b) {
      return undefined;
    }

    // ;
    let iSemicolon = -1;
    for (let i = iStart + 1; i < data.byteLength; i += 1) {
      if (data[i] === 0x3b) {
        iSemicolon = i;
        break;
      }
    }
    if (iSemicolon === -1) {
      return undefined;
    }

    // R
    let iR = -1;
    for (let i = iSemicolon + 1; i < data.byteLength; i += 1) {
      if (data[i] === 0x52) {
        iR = i;
        break;
      }
    }
    if (iR === -1) {
      return undefined;
    }

    const x = Number.parseInt(dec.decode(data.subarray(iSemicolon + 1, iR)));

    return [x, iR + 1];
  });

  return x1 - 1 - x;
}

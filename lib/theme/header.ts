import { sgr } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export let BACKGROUND: Uint8Array;
export let FILE_PATH: Uint8Array;
export let UNSAVED_FLAG: Uint8Array;

export function init(): void {
  BACKGROUND = sgr(["bg", ...t.LOWEST]);

  FILE_PATH = new Uint8Array([
    ...BACKGROUND,
    ...sgr(["fg", ...t.DARK]),
  ]);

  UNSAVED_FLAG = new Uint8Array([
    ...BACKGROUND,
    ...sgr(["fg", ...t.BRIGHT]),
  ]);
}

import { sgr } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function init(): void {
  BACKGROUND = sgr(["bg", ...t.LOWEST]);

  TEXT = new Uint8Array([
    ...BACKGROUND,
    ...sgr(["fg", ...t.DARK]),
  ]);
}

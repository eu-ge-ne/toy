import { sgr_256_bf, sgr_256_bg } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function init(): void {
  BACKGROUND = sgr_256_bg(t.LOWEST);
  TEXT = sgr_256_bf(t.LOWEST, t.DARK);
}

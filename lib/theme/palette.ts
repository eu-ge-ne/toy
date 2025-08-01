import { sgr_256_bf, sgr_256_bg } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export let BACKGROUND: Uint8Array;
export let OPTION: Uint8Array;
export let SELECTED_OPTION: Uint8Array;

export function init(): void {
  BACKGROUND = sgr_256_bg(t.HIGHEST);
  OPTION = sgr_256_bf(t.HIGHEST, t.LIGHTEST);
  SELECTED_OPTION = sgr_256_bf(t.TOP, t.LIGHTEST);
}

import { sgr_256_bf, sgr_256_bg } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export let BACKGROUND: Uint8Array;
export let BLANK: Uint8Array;
export let INDEX: Uint8Array;
export let EMPTY: Uint8Array;
export let CHAR: Uint8Array;
export let WHITESPACE: Uint8Array;
export let SELECTED_CHAR: Uint8Array;
export let SELECTED_WHITESPACE: Uint8Array;

export function init(): void {
  BACKGROUND = sgr_256_bg(t.LOWER);
  BLANK = sgr_256_bg(t.LOWEST);
  INDEX = sgr_256_bf(t.HIGHER, t.DARK);
  EMPTY = sgr_256_bf(t.LOWER, t.LOWER);
  CHAR = sgr_256_bf(t.LOWER, t.LIGHTEST);
  WHITESPACE = sgr_256_bf(t.LOWER, t.DARK);
  SELECTED_CHAR = sgr_256_bf(t.TOP, t.LIGHTEST);
  SELECTED_WHITESPACE = sgr_256_bf(t.TOP, t.DARKER);
}

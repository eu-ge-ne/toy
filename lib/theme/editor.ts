import { sgr } from "@eu-ge-ne/ctlseqs";

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
  BACKGROUND = sgr(["bg", ...t.LOWER]);
  BLANK = sgr(["bg", ...t.LOWEST]);

  INDEX = new Uint8Array([
    ...sgr(["bg", ...t.HIGHER]),
    ...sgr(["fg", ...t.DARK]),
  ]);

  EMPTY = new Uint8Array([
    ...BACKGROUND,
    ...sgr(["fg", ...t.LOWER]),
  ]);

  CHAR = new Uint8Array([
    ...BACKGROUND,
    ...sgr(["fg", ...t.LIGHTEST]),
  ]);

  WHITESPACE = new Uint8Array([
    ...BACKGROUND,
    ...sgr(["fg", ...t.DARK]),
  ]);

  SELECTED_CHAR = new Uint8Array([
    ...sgr(["bg", ...t.TOP]),
    ...sgr(["fg", ...t.LIGHTEST]),
  ]);

  SELECTED_WHITESPACE = new Uint8Array([
    ...sgr(["bg", ...t.TOP]),
    ...sgr(["fg", ...t.DARKER]),
  ]);
}

import { sgr } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export const BACKGROUND = sgr(["bg", ...t.LOWER]);
export const BLANK = sgr(["bg", ...t.LOWEST]);

export const INDEX = new Uint8Array([
  ...sgr(["bg", ...t.HIGHER]),
  ...sgr(["fg", ...t.DARK]),
]);

export const EMPTY = new Uint8Array([
  ...BACKGROUND,
  ...sgr(["fg", ...t.LOWER]),
]);

export const CHAR = new Uint8Array([
  ...BACKGROUND,
  ...sgr(["fg", ...t.LIGHTEST]),
]);

export const WHITESPACE = new Uint8Array([
  ...BACKGROUND,
  ...sgr(["fg", ...t.DARK]),
]);

export const SELECTED_CHAR = new Uint8Array([
  ...sgr(["bg", ...t.TOP]),
  ...sgr(["fg", ...t.LIGHTEST]),
]);

export const SELECTED_WHITESPACE = new Uint8Array([
  ...sgr(["bg", ...t.TOP]),
  ...sgr(["fg", ...t.DARKER]),
]);

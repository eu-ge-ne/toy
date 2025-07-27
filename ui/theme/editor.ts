import { sgr } from "@eu-ge-ne/ctlseqs";

import { DARK, DARKER, HIGHER, LIGHTEST, LOWER, TOP } from "./tokens.ts";

export const EDITOR_BG = new Uint8Array([
  ...sgr(["bg", ...LOWER]),
]);

export const EDITOR_LINE_INDEX_COLORS = new Uint8Array([
  ...sgr(["bg", ...HIGHER]),
  ...sgr(["fg", ...DARK]),
]);

export const EDITOR_BLANK_LINE_INDEX_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...DARK]),
]);

export const EDITOR_CHAR_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...LIGHTEST]),
]);

export const EDITOR_WHITESPACE_OFF_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...LOWER]),
]);

export const EDITOR_WHITESPACE_ON_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...DARK]),
]);

export const EDITOR_SELECTED_CHAR_COLORS = new Uint8Array([
  ...sgr(["bg", ...TOP]),
  ...sgr(["fg", ...LIGHTEST]),
]);

export const EDITOR_SELECTED_INVISIBLE_COLORS = new Uint8Array([
  ...sgr(["bg", ...TOP]),
  ...sgr(["fg", ...DARKER]),
]);

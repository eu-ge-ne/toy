import { sgr } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export const EDITOR_BG = sgr(["bg", ...t.LOWER]);

export const EDITOR_LINE_INDEX_COLORS = new Uint8Array([
  ...sgr(["bg", ...t.HIGHER]),
  ...sgr(["fg", ...t.DARK]),
]);

export const EDITOR_BLANK_LINE_INDEX_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...t.DARK]),
]);

export const EDITOR_CHAR_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...t.LIGHTEST]),
]);

export const EDITOR_EMPTY_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...t.LOWER]),
]);

export const EDITOR_WHITESPACE_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...t.DARK]),
]);

export const EDITOR_SELECTED_CHAR_COLORS = new Uint8Array([
  ...sgr(["bg", ...t.TOP]),
  ...sgr(["fg", ...t.LIGHTEST]),
]);

export const EDITOR_SELECTED_WHITESPACE_COLORS = new Uint8Array([
  ...sgr(["bg", ...t.TOP]),
  ...sgr(["fg", ...t.DARKER]),
]);

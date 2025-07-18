import { sgr } from "@eu-ge-ne/ctlseqs";

import { ABOVE, BELOW, DARK, DARKER, DARKEST, HI, LIGHTEST } from "./tokens.ts";

export const EDITOR_BG = new Uint8Array([
  ...sgr(["bg", ...BELOW]),
]);

export const EDITOR_LINE_INDEX_COLORS = new Uint8Array([
  ...sgr(["bg", ...ABOVE]),
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

export const EDITOR_INVISIBLE_OFF_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...DARKEST]),
]);

export const EDITOR_INVISIBLE_ON_COLORS = new Uint8Array([
  ...EDITOR_BG,
  ...sgr(["fg", ...DARK]),
]);

export const EDITOR_SELECTED_CHAR_COLORS = new Uint8Array([
  ...sgr(["bg", ...HI]),
  ...sgr(["fg", ...LIGHTEST]),
]);

export const EDITOR_SELECTED_INVISIBLE_COLORS = new Uint8Array([
  ...sgr(["bg", ...HI]),
  ...sgr(["fg", ...DARKER]),
]);

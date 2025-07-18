import { sgr } from "@eu-ge-ne/ctlseqs";

import { BOTTOM, BRIGHT, DARK } from "./tokens.ts";

export const HEADER_BG = new Uint8Array([
  ...sgr(["bg", ...BOTTOM]),
]);

export const HEADER_FILE_PATH_COLORS = new Uint8Array([
  ...HEADER_BG,
  ...sgr(["fg", ...DARK]),
]);

export const HEADER_FLAG_ON_COLORS = new Uint8Array([
  ...HEADER_BG,
  ...sgr(["fg", ...BRIGHT]),
]);

export const HEADER_FLAG_OFF_COLORS = new Uint8Array([
  ...HEADER_BG,
  ...sgr(["fg", ...BOTTOM]),
]);

export const VT_WIDTH_COLORS = new Uint8Array([
  ...HEADER_BG,
  ...sgr(["fg", ...BOTTOM]),
]);

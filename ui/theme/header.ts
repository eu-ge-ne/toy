import { sgr } from "@eu-ge-ne/ctlseqs";

import { BRIGHT, DARK, LOWEST } from "./tokens.ts";

export const HEADER_BG = new Uint8Array([
  ...sgr(["bg", ...LOWEST]),
]);

export const HEADER_FILE_PATH_COLORS = new Uint8Array([
  ...HEADER_BG,
  ...sgr(["fg", ...DARK]),
]);

export const HEADER_UNSAVED_FLAG_COLORS = new Uint8Array([
  ...HEADER_BG,
  ...sgr(["fg", ...BRIGHT]),
]);

export const VT_WIDTH_COLORS = new Uint8Array([
  ...HEADER_BG,
  ...sgr(["fg", ...LOWEST]),
]);

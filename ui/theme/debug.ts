import { sgr } from "@eu-ge-ne/ctlseqs";

import { DARK, HIGHER } from "./tokens.ts";

export const DEBUG_BG = new Uint8Array([
  ...sgr(["bg", ...HIGHER]),
]);

export const DEBUG_COLORS = new Uint8Array([
  ...DEBUG_BG,
  ...sgr(["fg", ...DARK]),
]);

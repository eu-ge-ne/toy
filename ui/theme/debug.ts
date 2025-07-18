import { sgr } from "@eu-ge-ne/ctlseqs";

import { ABOVE, DARK } from "./tokens.ts";

export const DEBUG_COLORS = new Uint8Array([
  ...sgr(["bg", ...ABOVE]),
  ...sgr(["fg", ...DARK]),
]);

export const DEBUG_BG = new Uint8Array([
  ...sgr(["bg", ...ABOVE]),
]);

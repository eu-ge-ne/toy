import { sgr } from "@eu-ge-ne/ctlseqs";

import { DARK, LOWEST } from "./tokens.ts";

export const FOOTER_BG = new Uint8Array([
  ...sgr(["bg", ...LOWEST]),
]);

export const FOOTER_CURSOR_COLORS = new Uint8Array([
  ...FOOTER_BG,
  ...sgr(["fg", ...DARK]),
]);

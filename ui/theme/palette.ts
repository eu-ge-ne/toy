import { sgr } from "@eu-ge-ne/ctlseqs";

import { HIGHEST, LIGHTEST } from "./tokens.ts";

export const PALETTE_BG = new Uint8Array([
  ...sgr(["bg", ...HIGHEST]),
]);

export const PALETTE_COLORS = new Uint8Array([
  ...PALETTE_BG,
  ...sgr(["fg", ...LIGHTEST]),
]);

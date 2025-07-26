import { sgr } from "@eu-ge-ne/ctlseqs";

import { HIGHEST, LIGHTEST, TOP } from "./tokens.ts";

export const PALETTE_BG = new Uint8Array([
  ...sgr(["bg", ...HIGHEST]),
]);

export const PALETTE_COLORS = new Uint8Array([
  ...PALETTE_BG,
  ...sgr(["fg", ...LIGHTEST]),
]);

export const PALETTE_SELECTED_COLORS = new Uint8Array([
  ...sgr(["bg", ...TOP]),
  ...sgr(["fg", ...LIGHTEST]),
]);

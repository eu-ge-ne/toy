import { sgr } from "@eu-ge-ne/ctlseqs";

import { LIGHTEST, TOP } from "./tokens.ts";

export const SAVE_AS_BG = new Uint8Array([
  ...sgr(["bg", ...TOP]),
]);

export const SAVE_AS_COLORS = new Uint8Array([
  ...SAVE_AS_BG,
  ...sgr(["fg", ...LIGHTEST]),
]);

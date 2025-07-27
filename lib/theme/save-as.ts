import { sgr } from "@eu-ge-ne/ctlseqs";

import { HIGHEST, LIGHTEST } from "./tokens.ts";

export const SAVE_AS_BG = new Uint8Array([
  ...sgr(["bg", ...HIGHEST]),
]);

export const SAVE_AS_COLORS = new Uint8Array([
  ...SAVE_AS_BG,
  ...sgr(["fg", ...LIGHTEST]),
]);

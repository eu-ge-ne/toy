import { sgr } from "@eu-ge-ne/ctlseqs";

import { LIGHTEST, TOP } from "./tokens.ts";

export const ASK_BG = new Uint8Array([
  ...sgr(["bg", ...TOP]),
]);

export const ASK_COLORS = new Uint8Array([
  ...ASK_BG,
  ...sgr(["fg", ...LIGHTEST]),
]);

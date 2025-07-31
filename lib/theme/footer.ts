import { sgr } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export const BACKGROUND = sgr(["bg", ...t.LOWEST]);

export const TEXT = new Uint8Array([
  ...BACKGROUND,
  ...sgr(["fg", ...t.DARK]),
]);

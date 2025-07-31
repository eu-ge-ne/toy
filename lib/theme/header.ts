import { sgr } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export const BACKGROUND = sgr(["bg", ...t.LOWEST]);

export const FILE_PATH = new Uint8Array([
  ...BACKGROUND,
  ...sgr(["fg", ...t.DARK]),
]);

export const UNSAVED_FLAG = new Uint8Array([
  ...BACKGROUND,
  ...sgr(["fg", ...t.BRIGHT]),
]);

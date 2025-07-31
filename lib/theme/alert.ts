import { sgr } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export const BACKGROUND = new Uint8Array([
  ...sgr(["bg", ...t.DANGER]),
]);

export const TEXT = new Uint8Array([
  ...BACKGROUND,
  ...sgr(["fg", ...t.LIGHTEST]),
]);

import { sgr } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export const BACKGROUND = sgr(["bg", ...t.HIGHEST]);

export const OPTION = new Uint8Array([
  ...BACKGROUND,
  ...sgr(["fg", ...t.LIGHTEST]),
]);

export const SELECTED_OPTION = new Uint8Array([
  ...sgr(["bg", ...t.TOP]),
  ...sgr(["fg", ...t.LIGHTEST]),
]);

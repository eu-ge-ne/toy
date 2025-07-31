import { sgr } from "@eu-ge-ne/ctlseqs";

import * as t from "./tokens.ts";

export let BACKGROUND: Uint8Array;
export let OPTION: Uint8Array;
export let SELECTED_OPTION: Uint8Array;

export function init(): void {
  BACKGROUND = sgr(["bg", ...t.HIGHEST]);

  OPTION = new Uint8Array([
    ...BACKGROUND,
    ...sgr(["fg", ...t.LIGHTEST]),
  ]);

  SELECTED_OPTION = new Uint8Array([
    ...sgr(["bg", ...t.TOP]),
    ...sgr(["fg", ...t.LIGHTEST]),
  ]);
}

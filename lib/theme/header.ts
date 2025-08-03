import { Tokens } from "./tokens.ts";

export let BACKGROUND: Uint8Array;
export let FILE_PATH: Uint8Array;
export let UNSAVED_FLAG: Uint8Array;

export function init(t: Tokens): void {
  BACKGROUND = t.bg_lowest;
  FILE_PATH = new Uint8Array([...t.bg_lowest, ...t.fg_dark]);
  UNSAVED_FLAG = new Uint8Array([...t.bg_lowest, ...t.fg_bright]);
}

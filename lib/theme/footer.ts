import { Tokens } from "./tokens.ts";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function init(t: Tokens): void {
  BACKGROUND = t.bg_lowest;
  TEXT = new Uint8Array([...t.bg_lowest, ...t.fg_dark]);
}

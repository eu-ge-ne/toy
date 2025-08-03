import { Tokens } from "./tokens.ts";

export let BACKGROUND: Uint8Array;
export let OPTION: Uint8Array;
export let SELECTED_OPTION: Uint8Array;

export function init(t: Tokens): void {
  BACKGROUND = t.bg_highest;
  OPTION = new Uint8Array([...t.bg_highest, ...t.fg_lightest]);
  SELECTED_OPTION = new Uint8Array([...t.bg_top, ...t.fg_lightest]);
}

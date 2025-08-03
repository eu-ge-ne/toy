import { Tokens } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function set_debug_colors(t: Tokens): void {
  BACKGROUND = t.bg_higher;
  TEXT = new Uint8Array([...t.bg_higher, ...t.fg_dark]);
}

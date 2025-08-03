import { Tokens } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function set_debug_colors(t: Tokens): void {
  BACKGROUND = t.bg_light0;
  TEXT = new Uint8Array([...t.bg_light0, ...t.fg_dark]);
}

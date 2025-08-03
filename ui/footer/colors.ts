import { Tokens } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function set_footer_colors(t: Tokens): void {
  BACKGROUND = t.bg_lowest;
  TEXT = new Uint8Array([...t.bg_lowest, ...t.fg_dark]);
}

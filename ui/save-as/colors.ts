import { Tokens } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function set_save_as_colors(t: Tokens): void {
  BACKGROUND = t.bg_highest;
  TEXT = new Uint8Array([...t.bg_highest, ...t.fg_lightest]);
}

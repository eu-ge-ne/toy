import { Tokens } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function set_ask_colors(t: Tokens): void {
  BACKGROUND = t.bg_light1;
  TEXT = new Uint8Array([...t.bg_light1, ...t.fg_lightest]);
}

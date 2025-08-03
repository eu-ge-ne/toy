import { Tokens } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let OPTION: Uint8Array;
export let SELECTED_OPTION: Uint8Array;

export function set_palette_colors(t: Tokens): void {
  BACKGROUND = t.bg_light1;
  OPTION = new Uint8Array([...t.bg_light1, ...t.fg_light1]);
  SELECTED_OPTION = new Uint8Array([...t.bg_light2, ...t.fg_light1]);
}

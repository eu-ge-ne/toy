import { Theme } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function set_footer_colors(t: Theme): void {
  BACKGROUND = t.bg_dark0;
  TEXT = new Uint8Array([...t.bg_dark0, ...t.fg_dark0]);
}

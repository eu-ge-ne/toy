import { Theme } from "@lib/themes";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function set_debug_colors(t: Theme): void {
  BACKGROUND = t.bg_light0;
  TEXT = new Uint8Array([...t.bg_light0, ...t.fg_dark0]);
}

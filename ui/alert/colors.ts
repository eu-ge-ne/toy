import { Theme } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function set_alert_colors(t: Theme): void {
  BACKGROUND = t.bg_danger;
  TEXT = new Uint8Array([...t.bg_danger, ...t.fg_light1]);
}

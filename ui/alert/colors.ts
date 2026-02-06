import { DefaultTheme, Theme } from "@lib/themes";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function setAlertColors(t: Theme): void {
  BACKGROUND = t.bg_danger;
  TEXT = new Uint8Array([...t.bg_danger, ...t.fg_light1]);
}

setAlertColors(DefaultTheme);

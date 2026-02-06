import { DefaultTheme, Theme } from "@lib/themes";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function setAskColors(t: Theme): void {
  BACKGROUND = t.bg_light1;
  TEXT = new Uint8Array([...t.bg_light1, ...t.fg_light1]);
}

setAskColors(DefaultTheme);

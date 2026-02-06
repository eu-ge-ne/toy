import { DefaultTheme, Theme } from "@lib/themes";

export let BACKGROUND: Uint8Array;
export let TEXT: Uint8Array;

export function setFooterColors(t: Theme): void {
  BACKGROUND = t.bg_dark0;
  TEXT = new Uint8Array([...t.bg_dark0, ...t.fg_dark0]);
}

setFooterColors(DefaultTheme);

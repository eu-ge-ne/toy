import { DefaultTheme, Theme } from "@lib/themes";

export let BACKGROUND: Uint8Array;
export let FILE_PATH: Uint8Array;
export let UNSAVED_FLAG: Uint8Array;

export function setHeaderColors(t: Theme): void {
  BACKGROUND = t.bg_dark0;
  FILE_PATH = new Uint8Array([...t.bg_dark0, ...t.fg_dark0]);
  UNSAVED_FLAG = new Uint8Array([...t.bg_dark0, ...t.fg_light2]);
}

setHeaderColors(DefaultTheme);

import { Tokens } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let FILE_PATH: Uint8Array;
export let UNSAVED_FLAG: Uint8Array;

export function set_header_colors(t: Tokens): void {
  BACKGROUND = t.bg_dark0;
  FILE_PATH = new Uint8Array([...t.bg_dark0, ...t.fg_dark]);
  UNSAVED_FLAG = new Uint8Array([...t.bg_dark0, ...t.fg_bright]);
}

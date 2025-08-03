import { Tokens } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let BLANK: Uint8Array;
export let INDEX: Uint8Array;
export let EMPTY: Uint8Array;
export let CHAR: Uint8Array;
export let WHITESPACE: Uint8Array;
export let SELECTED_CHAR: Uint8Array;
export let SELECTED_WHITESPACE: Uint8Array;

export function set_editor_colors(t: Tokens): void {
  BACKGROUND = t.bg_main;
  BLANK = t.bg_dark0;
  INDEX = new Uint8Array([...t.bg_light0, ...t.fg_dark]);
  EMPTY = new Uint8Array([...t.bg_main, ...t.fg_main]);
  CHAR = new Uint8Array([...t.bg_main, ...t.fg_lightest]);
  WHITESPACE = new Uint8Array([...t.bg_main, ...t.fg_dark]);
  SELECTED_CHAR = new Uint8Array([...t.bg_light2, ...t.fg_lightest]);
  SELECTED_WHITESPACE = new Uint8Array([...t.bg_light2, ...t.fg_darker]);
}

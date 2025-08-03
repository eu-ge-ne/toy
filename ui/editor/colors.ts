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
  BACKGROUND = t.bg_lower;
  BLANK = t.bg_lowest;
  INDEX = new Uint8Array([...t.bg_higher, ...t.fg_dark]);
  EMPTY = new Uint8Array([...t.bg_lower, ...t.fg_lower]);
  CHAR = new Uint8Array([...t.bg_lower, ...t.fg_lightest]);
  WHITESPACE = new Uint8Array([...t.bg_lower, ...t.fg_dark]);
  SELECTED_CHAR = new Uint8Array([...t.bg_top, ...t.fg_lightest]);
  SELECTED_WHITESPACE = new Uint8Array([...t.bg_top, ...t.fg_darker]);
}

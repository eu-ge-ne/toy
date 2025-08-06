import { Tokens } from "@lib/theme";

export let BACKGROUND: Uint8Array;
export let BLANK: Uint8Array;
export let INDEX: Uint8Array;

export const CHAR = {
  Char: new Uint8Array(),
  Whitespace: new Uint8Array(),
  Empty: new Uint8Array(),
};

export const SELECTED = {
  Char: new Uint8Array(),
  Whitespace: new Uint8Array(),
  Empty: new Uint8Array(),
};

export function set_editor_colors(t: Tokens): void {
  BACKGROUND = t.bg_main;
  BLANK = t.bg_dark0;
  INDEX = new Uint8Array([...t.bg_light0, ...t.fg_dark0]);

  CHAR.Char = new Uint8Array([...t.bg_main, ...t.fg_light1]);
  CHAR.Whitespace = new Uint8Array([...t.bg_main, ...t.fg_dark0]);
  CHAR.Empty = new Uint8Array([...t.bg_main, ...t.fg_main]);

  SELECTED.Char = new Uint8Array([...t.bg_light2, ...t.fg_light1]);
  SELECTED.Whitespace = new Uint8Array([...t.bg_light2, ...t.fg_dark1]);
  SELECTED.Empty = new Uint8Array([...t.bg_light2, ...t.fg_dark1]);
}

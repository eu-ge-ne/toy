import { Theme } from "@lib/themes";

export let BACKGROUND: Uint8Array;
export let INDEX: Uint8Array;
export let VOID: Uint8Array;
export let CHAR: Record<CharColor, Uint8Array>;

export const enum CharColor {
  Undefined,
  Visible,
  Whitespace,
  Empty,
  VisibleSelected,
  WhitespaceSelected,
  EmptySelected,
}

export function set_editor_colors(t: Theme): void {
  BACKGROUND = t.bg_main;
  INDEX = new Uint8Array([...t.bg_light0, ...t.fg_dark0]);
  VOID = t.bg_dark0;

  CHAR = {
    [CharColor.Undefined]: new Uint8Array(),
    [CharColor.Visible]: new Uint8Array([...t.bg_main, ...t.fg_light1]),
    [CharColor.Whitespace]: new Uint8Array([...t.bg_main, ...t.fg_dark0]),
    [CharColor.Empty]: new Uint8Array([...t.bg_main, ...t.fg_main]),
    [CharColor.VisibleSelected]: new Uint8Array([
      ...t.bg_light2,
      ...t.fg_light1,
    ]),
    [CharColor.WhitespaceSelected]: new Uint8Array([
      ...t.bg_light2,
      ...t.fg_dark1,
    ]),
    [CharColor.EmptySelected]: new Uint8Array([...t.bg_light2, ...t.fg_dark1]),
  };
}

export function create_char_color(
  is_selected: boolean,
  is_visible: boolean,
  whitespace_enabled: boolean,
): CharColor {
  if (is_selected) {
    if (is_visible) {
      return CharColor.VisibleSelected;
    } else if (whitespace_enabled) {
      return CharColor.WhitespaceSelected;
    } else {
      return CharColor.EmptySelected;
    }
  } else {
    if (is_visible) {
      return CharColor.Visible;
    } else if (whitespace_enabled) {
      return CharColor.Whitespace;
    } else {
      return CharColor.Empty;
    }
  }
}

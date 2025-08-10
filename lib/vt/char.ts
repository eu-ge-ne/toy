import { CSI } from "./ansi.ts";

export const enum CharAttr {
  Default = 0,
  Bold = 1,
  Faint = 2,
  Italicized = 3,
  Underlined = 4,
  Blink = 5,
  Inverse = 7,
  Invisible = 8,
  CrossedOut = 9,

  DoublyUnderlined = 21,
  Normal = 22,
  NotItalicized = 23,
  NotUnderlined = 24,
  Steady = 25,
  Positive = 27,
  Visible = 28,
  NotCrossedOut = 29,

  FgBlack = 30,
  FgRed = 31,
  FgGreen = 32,
  FgYellow = 33,
  FgBlue = 34,
  FgMagenta = 35,
  FgCyan = 36,
  FgWhite = 37,
  FgDefault = 39,

  BgBlack = 40,
  BgRed = 41,
  BgGreen = 42,
  BgYellow = 43,
  BgBlue = 44,
  BgMagenta = 45,
  BgCyan = 46,
  BgWhite = 47,
  BgDefault = 49,

  FgBrightBlack = 90,
  FgBrightRed = 91,
  FgBrightGreen = 92,
  FgBrightYellow = 93,
  FgBrightBlue = 94,
  FgBrightMagenta = 95,
  FgBrightCyan = 96,
  FgBrightWhite = 97,

  BgBrightBlack = 100,
  BgBrightRed = 101,
  BgBrightGreen = 102,
  BgBrightYellow = 103,
  BgBrightBlue = 104,
  BgBrightMagenta = 105,
  BgBrightCyan = 106,
  BgBrightWhite = 107,
}

export function char_attrs(...attrs: CharAttr[]): Uint8Array {
  return CSI(attrs.join(";") + "m");
}

export type RGBColor = [number, number, number];

export function char_fg(fg: RGBColor): Uint8Array {
  return CSI("38;2;" + fg.join(";") + "m");
}

export function char_bg(bg: RGBColor): Uint8Array {
  return CSI("48;2;" + bg.join(";") + "m");
}

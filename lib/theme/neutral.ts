import { char_bg, char_fg, RGBColor } from "@lib/vt";

import { Tokens } from "./tokens.ts";

const red: Record<number, RGBColor> = {
  900: [0x7f, 0x1d, 0x1d],
};

const neutral: Record<number, RGBColor> = {
  50: [0xfa, 0xfa, 0xfa],
  100: [0xf5, 0xf5, 0xf5],
  200: [0xe5, 0xe5, 0xe5],
  300: [0xd4, 0xd4, 0xd4],
  400: [0xa3, 0xa3, 0xa3],
  500: [0x73, 0x73, 0x73],
  600: [0x52, 0x52, 0x52],
  700: [0x40, 0x40, 0x40],
  800: [0x26, 0x26, 0x26],
  900: [0x17, 0x17, 0x17],
  950: [0x0a, 0x0a, 0x0a],
};

export const NEUTRAL: Tokens = {
  bg_danger: char_bg(red[900]!),
  bg_main: char_bg(neutral[900]!),
  fg_main: char_fg(neutral[900]!),

  bg_light2: char_bg(neutral[500]!),
  bg_light1: char_bg(neutral[700]!),
  bg_light0: char_bg(neutral[800]!),
  bg_dark0: char_bg(neutral[950]!),

  fg_light2: char_fg(neutral[100]!),
  fg_light1: char_fg(neutral[200]!),
  fg_light0: char_fg(neutral[300]!),
  fg_dark0: char_fg(neutral[400]!),
  fg_dark1: char_fg(neutral[600]!),
  fg_dark2: char_fg(neutral[700]!),
};

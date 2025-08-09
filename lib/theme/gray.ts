import { char_bg, char_fg, RGBColor } from "@lib/vt";

import { Tokens } from "./tokens.ts";

const red: Record<number, RGBColor> = {
  900: [0x7f, 0x1d, 0x1d],
};

const gray: Record<number, RGBColor> = {
  50: [0xf9, 0xfa, 0xfb],
  100: [0xf3, 0xf4, 0xf6],
  200: [0xe5, 0xe7, 0xeb],
  300: [0xd1, 0xd5, 0xdb],
  400: [0x9c, 0xa3, 0xaf],
  500: [0x6b, 0x72, 0x80],
  600: [0x4b, 0x55, 0x63],
  700: [0x37, 0x41, 0x51],
  800: [0x1f, 0x29, 0x37],
  900: [0x11, 0x18, 0x27],
  950: [0x03, 0x07, 0x12],
};

export const GRAY: Tokens = {
  bg_danger: char_bg(red[900]!),
  bg_main: char_bg(gray[900]!),
  fg_main: char_fg(gray[900]!),

  bg_light2: char_bg(gray[500]!),
  bg_light1: char_bg(gray[700]!),
  bg_light0: char_bg(gray[800]!),
  bg_dark0: char_bg(gray[950]!),

  fg_light2: char_fg(gray[100]!),
  fg_light1: char_fg(gray[200]!),
  fg_light0: char_fg(gray[300]!),
  fg_dark0: char_fg(gray[400]!),
  fg_dark1: char_fg(gray[600]!),
  fg_dark2: char_fg(gray[700]!),
};

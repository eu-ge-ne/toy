import { RGBColor, sgr_rgb_bg, sgr_rgb_fg } from "@lib/vt";

import { Tokens } from "./tokens.ts";

const red: Record<number, RGBColor> = {
  900: [0x7f, 0x1d, 0x1d],
};

const slate: Record<number, RGBColor> = {
  50: [0xf8, 0xfa, 0xfc],
  100: [0xf1, 0xf5, 0xf9],
  200: [0xe2, 0xe8, 0xf0],
  300: [0xcb, 0xd5, 0xe1],
  400: [0x94, 0xa3, 0xb8],
  500: [0x64, 0x74, 0x8b],
  600: [0x47, 0x55, 0x69],
  700: [0x33, 0x41, 0x55],
  800: [0x1e, 0x29, 0x3b],
  900: [0x0f, 0x17, 0x2a],
  950: [0x02, 0x06, 0x17],
};

export const SLATE: Tokens = {
  bg_danger: sgr_rgb_bg(red[900]!),
  bg_main: sgr_rgb_bg(slate[900]!),
  fg_main: sgr_rgb_fg(slate[900]!),

  bg_light2: sgr_rgb_bg(slate[500]!),
  bg_light1: sgr_rgb_bg(slate[700]!),
  bg_light0: sgr_rgb_bg(slate[800]!),
  bg_dark0: sgr_rgb_bg(slate[950]!),

  fg_light2: sgr_rgb_fg(slate[100]!),
  fg_light1: sgr_rgb_fg(slate[200]!),
  fg_light0: sgr_rgb_fg(slate[300]!),
  fg_dark0: sgr_rgb_fg(slate[400]!),
  fg_dark1: sgr_rgb_fg(slate[600]!),
  fg_dark2: sgr_rgb_fg(slate[700]!),
};

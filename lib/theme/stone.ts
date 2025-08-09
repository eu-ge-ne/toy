import { RGBColor, sgr_rgb_bg, sgr_rgb_fg } from "@lib/vt";

import { Tokens } from "./tokens.ts";

const red: Record<number, RGBColor> = {
  900: [0x7f, 0x1d, 0x1d],
};

const stone: Record<number, RGBColor> = {
  50: [0xfa, 0xfa, 0xf9],
  100: [0xf5, 0xf5, 0xf4],
  200: [0xe7, 0xe5, 0xe4],
  300: [0xd6, 0xd3, 0xd1],
  400: [0xa8, 0xa2, 0x9e],
  500: [0x78, 0x71, 0x6c],
  600: [0x57, 0x53, 0x4e],
  700: [0x44, 0x40, 0x3c],
  800: [0x29, 0x25, 0x24],
  900: [0x1c, 0x19, 0x17],
  950: [0x0c, 0x0a, 0x09],
};

export const STONE: Tokens = {
  bg_danger: sgr_rgb_bg(red[900]!),
  bg_main: sgr_rgb_bg(stone[900]!),
  fg_main: sgr_rgb_fg(stone[900]!),

  bg_light2: sgr_rgb_bg(stone[500]!),
  bg_light1: sgr_rgb_bg(stone[700]!),
  bg_light0: sgr_rgb_bg(stone[800]!),
  bg_dark0: sgr_rgb_bg(stone[950]!),

  fg_light2: sgr_rgb_fg(stone[100]!),
  fg_light1: sgr_rgb_fg(stone[200]!),
  fg_light0: sgr_rgb_fg(stone[300]!),
  fg_dark0: sgr_rgb_fg(stone[400]!),
  fg_dark1: sgr_rgb_fg(stone[600]!),
  fg_dark2: sgr_rgb_fg(stone[700]!),
};

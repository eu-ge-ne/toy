import { sgr_256_bg, sgr_256_fg, SGRColor256 } from "@eu-ge-ne/ctlseqs";

import { Tokens } from "./tokens.ts";

const red: Record<number, SGRColor256> = {
  900: [0x7f, 0x1d, 0x1d],
};

const gray: Record<number, SGRColor256> = {
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
  bg_danger: sgr_256_bg(red[900]!),

  bg_light2: sgr_256_bg(gray[500]!),
  bg_light1: sgr_256_bg(gray[700]!),
  bg_light0: sgr_256_bg(gray[800]!),
  bg_main: sgr_256_bg(gray[900]!),
  fg_main: sgr_256_fg(gray[900]!),
  bg_dark0: sgr_256_bg(gray[950]!),

  fg_bright: sgr_256_fg(gray[100]!),
  fg_lightest: sgr_256_fg(gray[200]!),
  fg_light: sgr_256_fg(gray[300]!),
  fg_dark: sgr_256_fg(gray[400]!),
  fg_darker: sgr_256_fg(gray[600]!),
  fg_darkest: sgr_256_fg(gray[700]!),
};

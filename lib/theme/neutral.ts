import { sgr_256_bg, sgr_256_fg, SGRColor256 } from "@eu-ge-ne/ctlseqs";

import { Tokens } from "./tokens.ts";

const red: Record<number, SGRColor256> = {
  900: [0x7f, 0x1d, 0x1d],
};

const neutral: Record<number, SGRColor256> = {
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
  bg_danger: sgr_256_bg(red[900]!),

  bg_top: sgr_256_bg(neutral[500]!),
  bg_highest: sgr_256_bg(neutral[700]!),
  bg_higher: sgr_256_bg(neutral[800]!),
  bg_lower: sgr_256_bg(neutral[900]!),
  bg_lowest: sgr_256_bg(neutral[950]!),

  fg_lower: sgr_256_fg(neutral[900]!),

  fg_bright: sgr_256_fg(neutral[100]!),
  fg_lightest: sgr_256_fg(neutral[200]!),
  fg_light: sgr_256_fg(neutral[300]!),
  fg_dark: sgr_256_fg(neutral[400]!),
  fg_darker: sgr_256_fg(neutral[600]!),
  fg_darkest: sgr_256_fg(neutral[700]!),
};

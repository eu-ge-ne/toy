import { sgr_256_bg, sgr_256_fg, SGRColor256 } from "@eu-ge-ne/ctlseqs";

import { Tokens } from "./tokens.ts";

const red: Record<number, SGRColor256> = {
  900: [0x7f, 0x1d, 0x1d],
};

const zinc: Record<number, SGRColor256> = {
  50: [0xfa, 0xfa, 0xfa],
  100: [0xf4, 0xf4, 0xf5],
  200: [0xe4, 0xe4, 0xe7],
  300: [0xd4, 0xd4, 0xd8],
  400: [0xa1, 0xa1, 0xaa],
  500: [0x71, 0x71, 0x7a],
  600: [0x52, 0x52, 0x5b],
  700: [0x3f, 0x3f, 0x46],
  800: [0x27, 0x27, 0x2a],
  900: [0x18, 0x18, 0x1b],
  950: [0x09, 0x09, 0x0b],
};

export const ZINC: Tokens = {
  bg_danger: sgr_256_bg(red[900]!),

  bg_light2: sgr_256_bg(zinc[500]!),
  bg_light1: sgr_256_bg(zinc[700]!),
  bg_light0: sgr_256_bg(zinc[800]!),
  bg_main: sgr_256_bg(zinc[900]!),
  fg_main: sgr_256_fg(zinc[900]!),
  bg_dark0: sgr_256_bg(zinc[950]!),

  fg_light2: sgr_256_fg(zinc[100]!),
  fg_light1: sgr_256_fg(zinc[200]!),
  fg_light0: sgr_256_fg(zinc[300]!),
  fg_dark0: sgr_256_fg(zinc[400]!),
  fg_dark1: sgr_256_fg(zinc[600]!),
  fg_dark2: sgr_256_fg(zinc[700]!),
};

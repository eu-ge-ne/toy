import { charBg, charFg, RGBColor } from "@lib/vt";

import { Theme } from "./theme.ts";

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

export const SlateTheme: Theme = {
  bgDanger: charBg(red[900]!),
  bgMain: charBg(slate[900]!),
  fgMain: charFg(slate[900]!),

  bgLight2: charBg(slate[500]!),
  bgLight1: charBg(slate[700]!),
  bgLight0: charBg(slate[800]!),
  bgDark0: charBg(slate[950]!),

  fgLight2: charFg(slate[100]!),
  fgLight1: charFg(slate[200]!),
  fgLight0: charFg(slate[300]!),
  fgDark0: charFg(slate[400]!),
  fgDark1: charFg(slate[600]!),
  fgDark2: charFg(slate[700]!),
};

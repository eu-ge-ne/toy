import { charBg, charFg, RGBColor } from "@lib/vt";

import { Theme } from "./theme.ts";

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

export const StoneTheme: Theme = {
  bgDanger: charBg(red[900]!),
  bgMain: charBg(stone[900]!),
  fgMain: charFg(stone[900]!),

  bgLight2: charBg(stone[500]!),
  bgLight1: charBg(stone[700]!),
  bgLight0: charBg(stone[800]!),
  bgDark0: charBg(stone[950]!),

  fgLight2: charFg(stone[100]!),
  fgLight1: charFg(stone[200]!),
  fgLight0: charFg(stone[300]!),
  fgDark0: charFg(stone[400]!),
  fgDark1: charFg(stone[600]!),
  fgDark2: charFg(stone[700]!),
};

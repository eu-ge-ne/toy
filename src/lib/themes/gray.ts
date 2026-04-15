import { charBg, charFg, RGBColor } from "@lib/vt";

import { Theme } from "./theme.ts";

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

export const GrayTheme: Theme = {
  bgDanger: charBg(red[900]!),
  bgMain: charBg(gray[900]!),
  fgMain: charFg(gray[900]!),

  bgLight2: charBg(gray[500]!),
  bgLight1: charBg(gray[700]!),
  bgLight0: charBg(gray[800]!),
  bgDark0: charBg(gray[950]!),

  fgLight2: charFg(gray[100]!),
  fgLight1: charFg(gray[200]!),
  fgLight0: charFg(gray[300]!),
  fgDark0: charFg(gray[400]!),
  fgDark1: charFg(gray[600]!),
  fgDark2: charFg(gray[700]!),
};

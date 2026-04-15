import { charBg, charFg, RGBColor } from "@lib/vt";

import { Theme } from "./theme.ts";

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

export const NeutralTheme: Theme = {
  bgDanger: charBg(red[900]!),
  bgMain: charBg(neutral[900]!),
  fgMain: charFg(neutral[900]!),

  bgLight2: charBg(neutral[500]!),
  bgLight1: charBg(neutral[700]!),
  bgLight0: charBg(neutral[800]!),
  bgDark0: charBg(neutral[950]!),

  fgLight2: charFg(neutral[100]!),
  fgLight1: charFg(neutral[200]!),
  fgLight0: charFg(neutral[300]!),
  fgDark0: charFg(neutral[400]!),
  fgDark1: charFg(neutral[600]!),
  fgDark2: charFg(neutral[700]!),
};

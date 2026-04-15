import { charBg, charFg, RGBColor } from "@lib/vt";

import { Theme } from "./theme.ts";

const red: Record<number, RGBColor> = {
  900: [0x7f, 0x1d, 0x1d],
};

const zinc: Record<number, RGBColor> = {
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

export const ZincTheme: Theme = {
  bgDanger: charBg(red[900]!),
  bgMain: charBg(zinc[900]!),
  fgMain: charFg(zinc[900]!),

  bgLight2: charBg(zinc[500]!),
  bgLight1: charBg(zinc[700]!),
  bgLight0: charBg(zinc[800]!),
  bgDark0: charBg(zinc[950]!),

  fgLight2: charFg(zinc[100]!),
  fgLight1: charFg(zinc[200]!),
  fgLight0: charFg(zinc[300]!),
  fgDark0: charFg(zinc[400]!),
  fgDark1: charFg(zinc[600]!),
  fgDark2: charFg(zinc[700]!),
};

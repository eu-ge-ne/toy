import colors from "@libs/colors" with { type: "json" };
import { charBg, charFg } from "@libs/vt";

import { Theme } from "./theme.ts";

export const Mist: Theme = {
  bgDanger: charBg(colors.red900),
  bgMain: charBg(colors.mist900),
  fgMain: charFg(colors.mist900),

  bgLight2: charBg(colors.mist500),
  bgLight1: charBg(colors.mist700),
  bgLight0: charBg(colors.mist800),
  bgDark0: charBg(colors.mist950),

  fgLight2: charFg(colors.mist100),
  fgLight1: charFg(colors.mist200),
  fgLight0: charFg(colors.mist300),
  fgDark0: charFg(colors.mist400),
  fgDark1: charFg(colors.mist600),
  fgDark2: charFg(colors.mist700),
};

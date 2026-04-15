import colors from "@lib/colors" with { type: "json" };
import { charBg, charFg } from "@lib/vt";

import { Theme } from "./theme.ts";

export const Mauve: Theme = {
  bgDanger: charBg(colors.red900),
  bgMain: charBg(colors.mauve900),
  fgMain: charFg(colors.mauve900),

  bgLight2: charBg(colors.mauve500),
  bgLight1: charBg(colors.mauve700),
  bgLight0: charBg(colors.mauve800),
  bgDark0: charBg(colors.mauve950),

  fgLight2: charFg(colors.mauve100),
  fgLight1: charFg(colors.mauve200),
  fgLight0: charFg(colors.mauve300),
  fgDark0: charFg(colors.mauve400),
  fgDark1: charFg(colors.mauve600),
  fgDark2: charFg(colors.mauve700),
};

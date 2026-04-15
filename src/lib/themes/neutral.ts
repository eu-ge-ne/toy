import colors from "@lib/colors" with { type: "json" };
import { charBg, charFg } from "@lib/vt";

import { Theme } from "./theme.ts";

export const Neutral: Theme = {
  bgDanger: charBg(colors.red900),
  bgMain: charBg(colors.neutral900),
  fgMain: charFg(colors.neutral900),

  bgLight2: charBg(colors.neutral500),
  bgLight1: charBg(colors.neutral700),
  bgLight0: charBg(colors.neutral800),
  bgDark0: charBg(colors.neutral950),

  fgLight2: charFg(colors.neutral100),
  fgLight1: charFg(colors.neutral200),
  fgLight0: charFg(colors.neutral300),
  fgDark0: charFg(colors.neutral400),
  fgDark1: charFg(colors.neutral600),
  fgDark2: charFg(colors.neutral700),
};

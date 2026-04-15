import colors from "@lib/colors" with { type: "json" };
import { charBg, charFg } from "@lib/vt";

import { Theme } from "./theme.ts";

export const GrayTheme: Theme = {
  bgDanger: charBg(colors.red900),
  bgMain: charBg(colors.gray900),
  fgMain: charFg(colors.gray900),

  bgLight2: charBg(colors.gray500),
  bgLight1: charBg(colors.gray700),
  bgLight0: charBg(colors.gray800),
  bgDark0: charBg(colors.gray950),

  fgLight2: charFg(colors.gray100),
  fgLight1: charFg(colors.gray200),
  fgLight0: charFg(colors.gray300),
  fgDark0: charFg(colors.gray400),
  fgDark1: charFg(colors.gray600),
  fgDark2: charFg(colors.gray700),
};

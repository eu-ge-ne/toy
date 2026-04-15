import colors from "@lib/colors" with { type: "json" };
import { charBg, charFg } from "@lib/vt";

import { Theme } from "./theme.ts";

export const Stone: Theme = {
  bgDanger: charBg(colors.red900),
  bgMain: charBg(colors.stone900),
  fgMain: charFg(colors.stone900),

  bgLight2: charBg(colors.stone500),
  bgLight1: charBg(colors.stone700),
  bgLight0: charBg(colors.stone800),
  bgDark0: charBg(colors.stone950),

  fgLight2: charFg(colors.stone100),
  fgLight1: charFg(colors.stone200),
  fgLight0: charFg(colors.stone300),
  fgDark0: charFg(colors.stone400),
  fgDark1: charFg(colors.stone600),
  fgDark2: charFg(colors.stone700),
};

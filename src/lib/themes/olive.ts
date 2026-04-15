import colors from "@lib/colors" with { type: "json" };
import { charBg, charFg } from "@lib/vt";

import { Theme } from "./theme.ts";

export const Olive: Theme = {
  bgDanger: charBg(colors.red900),
  bgMain: charBg(colors.olive900),
  fgMain: charFg(colors.olive900),

  bgLight2: charBg(colors.olive500),
  bgLight1: charBg(colors.olive700),
  bgLight0: charBg(colors.olive800),
  bgDark0: charBg(colors.olive950),

  fgLight2: charFg(colors.olive100),
  fgLight1: charFg(colors.olive200),
  fgLight0: charFg(colors.olive300),
  fgDark0: charFg(colors.olive400),
  fgDark1: charFg(colors.olive600),
  fgDark2: charFg(colors.olive700),
};

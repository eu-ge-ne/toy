import colors from "@lib/colors" with { type: "json" };
import { charBg, charFg } from "@lib/vt";

import { Theme } from "./theme.ts";

export const Taupe: Theme = {
  bgDanger: charBg(colors.red900),
  bgMain: charBg(colors.taupe900),
  fgMain: charFg(colors.taupe900),

  bgLight2: charBg(colors.taupe500),
  bgLight1: charBg(colors.taupe700),
  bgLight0: charBg(colors.taupe800),
  bgDark0: charBg(colors.taupe950),

  fgLight2: charFg(colors.taupe100),
  fgLight1: charFg(colors.taupe200),
  fgLight0: charFg(colors.taupe300),
  fgDark0: charFg(colors.taupe400),
  fgDark1: charFg(colors.taupe600),
  fgDark2: charFg(colors.taupe700),
};

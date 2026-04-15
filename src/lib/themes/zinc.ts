import colors from "@lib/colors" with { type: "json" };
import { charBg, charFg } from "@lib/vt";

import { Theme } from "./theme.ts";

export const Zinc: Theme = {
  bgDanger: charBg(colors.red900),
  bgMain: charBg(colors.zinc900),
  fgMain: charFg(colors.zinc900),

  bgLight2: charBg(colors.zinc500),
  bgLight1: charBg(colors.zinc700),
  bgLight0: charBg(colors.zinc800),
  bgDark0: charBg(colors.zinc950),

  fgLight2: charFg(colors.zinc100),
  fgLight1: charFg(colors.zinc200),
  fgLight0: charFg(colors.zinc300),
  fgDark0: charFg(colors.zinc400),
  fgDark1: charFg(colors.zinc600),
  fgDark2: charFg(colors.zinc700),
};

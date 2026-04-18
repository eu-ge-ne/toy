import colors from "@libs/colors" with { type: "json" };
import { charBg, charFg } from "@libs/vt";

import { Theme } from "./theme.ts";

export const Slate: Theme = {
  bgDanger: charBg(colors.red900),
  bgMain: charBg(colors.slate900),
  fgMain: charFg(colors.slate900),

  bgLight2: charBg(colors.slate500),
  bgLight1: charBg(colors.slate700),
  bgLight0: charBg(colors.slate800),
  bgDark0: charBg(colors.slate950),

  fgLight2: charFg(colors.slate100),
  fgLight1: charFg(colors.slate200),
  fgLight0: charFg(colors.slate300),
  fgDark0: charFg(colors.slate400),
  fgDark1: charFg(colors.slate600),
  fgDark2: charFg(colors.slate700),
};

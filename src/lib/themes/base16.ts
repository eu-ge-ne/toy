import { CharAttr, charAttrs } from "@lib/vt";

import { Theme } from "./theme.ts";

export const Base16Theme: Theme = {
  bgDanger: charAttrs(CharAttr.BgRed),
  bgMain: charAttrs(CharAttr.BgBlack),
  fgMain: charAttrs(CharAttr.FgBlack),

  bgLight2: charAttrs(CharAttr.BgCyan),
  bgLight1: charAttrs(CharAttr.BgBrightBlack),
  bgLight0: charAttrs(CharAttr.BgBrightBlack),
  bgDark0: charAttrs(CharAttr.BgBlack),

  fgLight2: charAttrs(CharAttr.FgCyan),
  fgLight1: charAttrs(CharAttr.FgBrightWhite),
  fgLight0: charAttrs(CharAttr.FgBrightWhite),
  fgDark0: charAttrs(CharAttr.FgWhite),
  fgDark1: charAttrs(CharAttr.FgWhite),
  fgDark2: charAttrs(CharAttr.FgWhite),
};

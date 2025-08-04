import { sgr, SGRAttr } from "@eu-ge-ne/ctlseqs";

import { Tokens } from "./tokens.ts";

export const BASE16: Tokens = {
  bg_danger: sgr(SGRAttr.BgRed),
  bg_main: sgr(SGRAttr.BgBlack),
  fg_main: sgr(SGRAttr.FgBlack),

  bg_light2: sgr(SGRAttr.BgCyan),
  bg_light1: sgr(SGRAttr.BgBrightBlack),
  bg_light0: sgr(SGRAttr.BgBrightBlack),
  bg_dark0: sgr(SGRAttr.BgBlack),

  fg_light2: sgr(SGRAttr.FgCyan),
  fg_light1: sgr(SGRAttr.FgBrightWhite),
  fg_light0: sgr(SGRAttr.FgBrightWhite),
  fg_dark0: sgr(SGRAttr.FgWhite),
  fg_dark1: sgr(SGRAttr.FgWhite),
  fg_dark2: sgr(SGRAttr.FgWhite),
};

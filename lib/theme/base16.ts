import { sgr, SGRAttr } from "@eu-ge-ne/ctlseqs";

import { Tokens } from "./tokens.ts";

export const BASE16: Tokens = {
  bg_danger: sgr(SGRAttr.BgRed),

  bg_light2: sgr(100 as unknown as SGRAttr),
  bg_light1: sgr(100 as unknown as SGRAttr),
  bg_light0: sgr(SGRAttr.BgBlack),
  bg_main: sgr(SGRAttr.BgBlack),
  fg_main: sgr(SGRAttr.FgBlack),
  bg_dark0: sgr(SGRAttr.BgBlack),

  fg_light2: sgr(97 as unknown as SGRAttr),
  fg_light1: sgr(97 as unknown as SGRAttr),
  fg_light0: sgr(SGRAttr.FgWhite),
  fg_dark0: sgr(SGRAttr.FgWhite),
  fg_dark1: sgr(SGRAttr.FgWhite),
  fg_dark2: sgr(SGRAttr.FgWhite),
};

import { sgr, SGRAttr } from "@eu-ge-ne/ctlseqs";

import { Tokens } from "./tokens.ts";

const encoder = new TextEncoder();

export const BASE16: Tokens = {
  bg_danger: sgr(SGRAttr.BgRed),

  bg_light2: encoder.encode("\x1b[100m"),
  bg_light1: encoder.encode("\x1b[100m"),
  bg_light0: sgr(SGRAttr.BgBlack),
  bg_main: sgr(SGRAttr.BgBlack),
  fg_main: sgr(SGRAttr.FgBlack),
  bg_dark0: sgr(SGRAttr.BgBlack),

  fg_light2: encoder.encode("\x1b[97m"),
  fg_light1: encoder.encode("\x1b[97m"),
  fg_light0: sgr(SGRAttr.FgWhite),
  fg_dark0: sgr(SGRAttr.FgWhite),
  fg_dark1: sgr(SGRAttr.FgWhite),
  fg_dark2: sgr(SGRAttr.FgWhite),
};

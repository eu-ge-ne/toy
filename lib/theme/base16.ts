import { char_attrs, CharAttr } from "@lib/vt";

import { Theme } from "./tokens.ts";

export const BASE16: Theme = {
  bg_danger: char_attrs(CharAttr.BgRed),
  bg_main: char_attrs(CharAttr.BgBlack),
  fg_main: char_attrs(CharAttr.FgBlack),

  bg_light2: char_attrs(CharAttr.BgCyan),
  bg_light1: char_attrs(CharAttr.BgBrightBlack),
  bg_light0: char_attrs(CharAttr.BgBrightBlack),
  bg_dark0: char_attrs(CharAttr.BgBlack),

  fg_light2: char_attrs(CharAttr.FgCyan),
  fg_light1: char_attrs(CharAttr.FgBrightWhite),
  fg_light0: char_attrs(CharAttr.FgBrightWhite),
  fg_dark0: char_attrs(CharAttr.FgWhite),
  fg_dark1: char_attrs(CharAttr.FgWhite),
  fg_dark2: char_attrs(CharAttr.FgWhite),
};

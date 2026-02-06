import * as vt from "@lib/vt";

import { Base16Theme } from "./base16.ts";
import { GrayTheme } from "./gray.ts";
import { NeutralTheme } from "./neutral.ts";
import { SlateTheme } from "./slate.ts";
import { StoneTheme } from "./stone.ts";
import { ZincTheme } from "./zinc.ts";

export * from "./theme.ts";

export const DefaultTheme = vt.TRUECOLOR ? NeutralTheme : Base16Theme;

export const Themes = {
  Base16: Base16Theme,
  Gray: GrayTheme,
  Neutral: NeutralTheme,
  Slate: SlateTheme,
  Stone: StoneTheme,
  Zinc: ZincTheme,
};

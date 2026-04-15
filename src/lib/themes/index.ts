import * as vt from "@lib/vt";

import { Base16 } from "./base16.ts";
import { Gray } from "./gray.ts";
import { Neutral } from "./neutral.ts";
import { Slate } from "./slate.ts";
import { Stone } from "./stone.ts";
import { Taupe } from "./taupe.ts";
import { Zinc } from "./zinc.ts";

export * from "./theme.ts";

export const Themes = {
  Default: vt.TRUECOLOR ? Neutral : Base16,
  Base16,
  Gray,
  Neutral,
  Slate,
  Stone,
  Zinc,
  Taupe,
};

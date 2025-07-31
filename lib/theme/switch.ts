import * as alert from "./alert.ts";
import * as ask from "./alert.ts";
import * as debug from "./debug.ts";
import * as editor from "./editor.ts";
import * as footer from "./footer.ts";
import * as header from "./header.ts";
import * as palette from "./palette.ts";
import * as save_as from "./save-as.ts";

import { Colors, set_colors } from "./tokens.ts";

export function switch_theme(colors: Colors): void {
  set_colors(colors);

  alert.init();
  ask.init();
  debug.init();
  editor.init();
  footer.init();
  header.init();
  palette.init();
  save_as.init();
}

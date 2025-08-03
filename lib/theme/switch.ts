import * as palette from "./palette.ts";
import * as save_as from "./save-as.ts";
import { Tokens } from "./tokens.ts";

export function switch_theme(t: Tokens): void {
  palette.init(t);
  save_as.init(t);
}

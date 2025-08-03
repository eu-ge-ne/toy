import * as header from "./header.ts";
import * as palette from "./palette.ts";
import * as save_as from "./save-as.ts";
import { Tokens } from "./tokens.ts";

export function switch_theme(t: Tokens): void {
  header.init(t);
  palette.init(t);
  save_as.init(t);
}

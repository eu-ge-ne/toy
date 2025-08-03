import * as save_as from "./save-as.ts";
import { Tokens } from "./tokens.ts";

export function switch_theme(t: Tokens): void {
  save_as.init(t);
}

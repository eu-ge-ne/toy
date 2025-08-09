import { OSC, ST } from "./ansi.ts";
import { write } from "./write.ts";

// https://www.invisible-island.net/xterm/ctlseqs/ctlseqs.html#h4-Operating-System-Commands:OSC-Ps;Pt-ST:Ps-=-5-2.101B
export function copy_to_clipboard(text: string): void {
  write(OSC(`52;c;${btoa(text)}${ST}`));
}

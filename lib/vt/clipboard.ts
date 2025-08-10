import { OSC, ST } from "./ansi.ts";
import { write } from "./write.ts";

export function copy_to_clipboard(text: string): void {
  write(OSC(`52;c;${btoa(text)}${ST}`));
}

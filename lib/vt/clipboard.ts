import { OSC, ST } from "./ansi.ts";
import { Writer } from "./writer.ts";

export function copy_to_clipboard(out: Writer, text: string): void {
  out.write(OSC(`52;c;${btoa(text)}${ST}`));
}

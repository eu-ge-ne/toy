import { OSC, ST } from "./ansi.ts";
import { Writer } from "./writer.ts";

export function copyToClipboard(out: Writer, text: string): void {
  out.write(OSC(`52;c;${btoa(text)}${ST}`));
}

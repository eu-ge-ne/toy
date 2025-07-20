import { osc52 } from "@eu-ge-ne/ctlseqs";

export function copy_to_clipboard(text: string): Uint8Array {
  return osc52(text);
}

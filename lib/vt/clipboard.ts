import { osc52 } from "@eu-ge-ne/ctlseqs";

import { write } from "./write.ts";

export function copy_to_clipboard(text: string): void {
  write(osc52(text));
}

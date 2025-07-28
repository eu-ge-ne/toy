import { cpr_req } from "@eu-ge-ne/ctlseqs";

import { write } from "./write.ts";

export function dummy_req(): void {
  write(cpr_req);
}

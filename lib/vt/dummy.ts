import { cpr_req } from "./cursor.ts";
import { write } from "./write.ts";

export function dummy_req(): void {
  write(cpr_req);
}

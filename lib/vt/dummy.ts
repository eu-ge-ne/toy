import { sync } from "./sync.ts";
import { cpr_req } from "./wchar.ts";

export function dummy_req(): void {
  sync.write(cpr_req);
}

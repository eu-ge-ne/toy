import { cpr_req } from "./wchar.ts";
import { sync } from "./writer.ts";

export function dummy_req(): void {
  sync.write(cpr_req);
}

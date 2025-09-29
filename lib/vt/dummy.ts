import { cpr_req } from "./cursor.ts";
import { Writer } from "./writer.ts";

export function dummy_req(out: Writer): void {
  out.write(cpr_req);
}

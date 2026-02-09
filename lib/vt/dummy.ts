import { cprReq } from "./wchar.ts";
import { sync } from "./writer.ts";

export function dummyReq(): void {
  sync.write(cprReq);
}

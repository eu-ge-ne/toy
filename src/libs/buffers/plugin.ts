import "@libs/plugins";
import * as plugins from "@libs/plugins";

import { Buffer } from "./buffer.ts";

declare module "@libs/plugins" {
  export interface API {
    buffer: Buffer;
  }
}
export function plugin(): plugins.Result {
  return {
    buffer: new Buffer(),
  };
}

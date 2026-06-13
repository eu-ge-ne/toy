import * as buffers from "@libs/buffers";
import * as plugins from "@plugins/plugins";

declare module "@plugins/plugins" {
  export interface API {
    buffer: buffers.Buffer;
  }
}

export function plugin(): plugins.Result {
  return {
    buffer: new buffers.Buffer(),
  };
}

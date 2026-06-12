import * as buffers from "@libs/buffers";
import * as plugins from "@libs/plugins";

export function plugin(): plugins.Result {
  return {
    buffer: new buffers.BufferAPI(),
  };
}

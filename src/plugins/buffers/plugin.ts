import * as buffers from "@libs/buffers";
import * as plugins from "@libs/plugins";

export function plugin(): plugins.Plugin {
  return {
    buffer: new buffers.Buffer(),
  };
}

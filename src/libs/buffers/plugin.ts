import * as buffers from "@libs/buffers";
import * as plugins from "@libs/plugins";

export const plugin = {
  register: {
    buffer(): buffers.BufferAPI {
      return new buffers.BufferAPI();
    },
  },
} satisfies plugins.Plugin;

import * as api from "@libs/api";
import * as buffers from "@libs/buffers";
import * as plugins from "@libs/plugins";

export const plugin = {
  register: {
    buffer(_: api.Toy): buffers.BufferAPI {
      return new buffers.BufferAPI();
    },
  },
} satisfies plugins.Plugin;

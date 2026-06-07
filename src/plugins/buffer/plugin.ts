import * as api from "@libs/api";
import * as buffers from "@libs/buffers";
import * as plugins from "@libs/plugins";

export default {
  register: {
    buffer(_: api.Toy): buffers.Buffer {
      return new buffers.Buffer();
    },
  },
} satisfies plugins.Plugin;

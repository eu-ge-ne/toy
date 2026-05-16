import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";

export default {
  register: {
    about(_: api.Toy): api.About {
      return {
        get version(): string {
          return std.version;
        },
      };
    },
  },
} satisfies plugins.Plugin;

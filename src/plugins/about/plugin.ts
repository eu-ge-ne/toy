import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as version from "@libs/version";

export default {
  register: {
    about(_: api.Toy): api.About {
      return {
        get version(): string {
          return version.version;
        },
      };
    },
  },
} satisfies plugins.Plugin;

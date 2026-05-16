import * as api from "@libs/api";
import * as plugins from "@libs/plugins";

import deno from "../../../deno.json" with { type: "json" };

const version = `toy ${deno.version} (deno ${Deno.version.deno})`;

export default {
  register: {
    about(_: api.Toy): api.About {
      return {
        get version(): string {
          return version;
        },
      };
    },
  },
} satisfies plugins.Plugin;

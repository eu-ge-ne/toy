import * as api from "@libs/api";
import * as plugins from "@libs/plugins";

import deno from "../../../deno.json" with { type: "json" };

const version = `toy ${deno.version} (deno ${Deno.version.deno})`;

export default class AboutPlugin extends plugins.Plugin {
  override initAbout(_: api.Host): api.About {
    return new class extends api.About {
      get version(): string {
        return version;
      }
    }();
  }
}

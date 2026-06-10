import { parseArgs } from "@std/cli/parse-args";

import * as alertModal from "@libs/alert-modal";
import * as buffers from "@libs/buffers";
import * as confirmModal from "@libs/confirm-modal";
import * as debug from "@libs/debug";
import * as fileNameModal from "@libs/file-name-modal";
import * as footer from "@libs/footer";
import * as header from "@libs/header";
import * as io from "@libs/io";
import * as paletteModal from "@libs/palette-modal";
import * as plugins from "@libs/plugins";
import * as runtime from "@libs/runtime";
import * as shortcuts from "@libs/shortcuts";
import * as std from "@libs/std";
import * as themes from "@libs/themes";
import * as views from "@libs/views";
import * as zen from "@libs/zen";

export const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(std.version);
  Deno.exit();
}

class API extends plugins.API {
  #inits: (() => void)[] = [];

  register(plugin: plugins.Plugin): void {
    // deno-lint-ignore no-explicit-any
    const rawThis = this as any;

    for (const [name, api] of Object.entries(plugin(this))) {
      if (name === "init" && typeof api === "function") {
        this.#inits.push(api);
        continue;
      }

      if (rawThis[name]) {
        throw new Error("API conflict");
      }

      rawThis[name] = api;
    }
  }

  init(): void {
    for (const init of this.#inits) {
      init();
    }
  }
}

const api = new API();

api.register(alertModal.plugin);
api.register(buffers.plugin);
api.register(confirmModal.plugin);
api.register(debug.plugin);
api.register(fileNameModal.plugin);
api.register(footer.plugin);
api.register(header.plugin);
api.register(io.plugin);
api.register(paletteModal.plugin);
api.register(runtime.plugin);
api.register(shortcuts.plugin);
api.register(themes.plugin);
api.register(views.plugin);
api.register(zen.plugin);

api.init();

await api.runtime.start();

api.io.resize();

if (typeof args._[0] === "string") {
  await api.runtime.open(args._[0]);
}

await api.io.loop(() => {});

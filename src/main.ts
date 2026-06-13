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

const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(std.version);
  Deno.exit();
}

const api = {} as plugins.API;
const inits: (() => void)[] = [];

function register(plugin: plugins.Plugin): void {
  for (const [k, v] of Object.entries(plugin(api))) {
    if ((api as unknown as Record<string, unknown>)[k]) {
      throw new Error("API conflict");
    }

    if (k === "init" && typeof v === "function") {
      inits.push(v);
    } else {
      (api as unknown as Record<string, unknown>)[k] = v;
    }
  }
}

register(alertModal.plugin);
register(buffers.plugin);
register(confirmModal.plugin);
register(debug.plugin);
register(fileNameModal.plugin);
register(footer.plugin);
register(header.plugin);
register(io.plugin);
register(paletteModal.plugin);
register(runtime.plugin);
register(shortcuts.plugin);
register(themes.plugin);
register(views.plugin);
register(zen.plugin);

for (const init of inits) {
  init();
}

await api.runtime.start();

api.io.resize();

if (typeof args._[0] === "string") {
  await api.runtime.open(args._[0]);
}

await api.io.loop(() => {});

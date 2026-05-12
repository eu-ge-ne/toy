import { parseArgs } from "@std/cli/parse-args";

import about from "@plugins/about";
import alertModal from "@plugins/alert-modal";
import confirmModal from "@plugins/confirm-modal";
import debug from "@plugins/debug";
import doc from "@plugins/doc";
import fileNameModal from "@plugins/file-name-modal";
import footer from "@plugins/footer";
import header from "@plugins/header";
import io from "@plugins/io";
import paletteModal from "@plugins/palette-modal";
import runtime from "@plugins/runtime";
import shortcuts from "@plugins/shortcuts";
import theme from "@plugins/theme";
import zen from "@plugins/zen";

import { Host } from "./host.ts";

const host = new Host();
host.register(runtime);
host.register(io);
host.register(alertModal);
host.register(confirmModal);
host.register(fileNameModal);
host.register(debug);
host.register(doc);
host.register(footer);
host.register(header);
host.register(paletteModal);
host.register(shortcuts);
host.register(theme);
host.register(zen);
host.register(about);

export const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(host.about.version);
  Deno.exit();
}

host.init();
await host.runtime.start();
host.theme.set("Default");

let layoutChanged = false;

host.zen.events.reactOrdered("toggle", 1000, () => layoutChanged = true);

if (typeof args._[0] === "string") {
  await host.doc.open(args._[0]);
}

await host.io.runLoop((ctx) => {
  if (layoutChanged) {
    ctx.layoutChanged = true;
    layoutChanged = false;
  }
});

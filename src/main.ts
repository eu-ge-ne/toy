import { parseArgs } from "@std/cli/parse-args";

import alertModal from "@plugins/alert-modal";
import confirmModal from "@plugins/confirm-modal";
import debug from "@plugins/debug";
import doc from "@plugins/doc";
import fileNameModal from "@plugins/file-name-modal";
import footer from "@plugins/footer";
import header from "@plugins/header";
import io from "@plugins/io";
import paletteModal from "@plugins/palette-modal";
import shortcuts from "@plugins/shortcuts";
import theme from "@plugins/theme";

import deno from "../deno.json" with { type: "json" };
import { Host } from "./host.ts";

const version = `toy ${deno.version} (deno ${Deno.version.deno})`;

export const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(version);
  Deno.exit();
}

const host = new Host();
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
host.run();

let layoutChanged = false;

host.reactOrdered("zen.toggle", 1000, () => layoutChanged = true);

await host.emitStart({ version });
host.theme.set("Default");

if (typeof args._[0] === "string") {
  await host.doc.open(args._[0]);
}

await host.io.runLoop((ctx) => {
  if (layoutChanged) {
    ctx.layoutChanged = true;
    layoutChanged = false;
  }
});

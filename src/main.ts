import { parseArgs } from "@std/cli/parse-args";

import * as vt from "@libs/vt";

import alert from "@plugins/alert";
import ask from "@plugins/ask";
import askFileName from "@plugins/ask-file-name";
import debug from "@plugins/debug";
import doc from "@plugins/doc";
import footer from "@plugins/footer";
import header from "@plugins/header";
import palette from "@plugins/palette";
import shortcuts from "@plugins/shortcuts";

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

host.register(alert);
host.register(ask);
host.register(askFileName);
host.register(debug);
host.register(doc);
host.register(footer);
host.register(header);
host.register(palette);
host.register(shortcuts);

Deno.addSignalListener("SIGWINCH", () => {
  host.resize();
  host.render();
});

host.intercept("start", async () => {
  globalThis.addEventListener("unhandledrejection", (e) => host.emitStop(e));

  vt.init();
});

host.interceptOrdered("stop", 1000, ({ e }) => {
  vt.restore();

  if (e) {
    console.log(e.reason);
  }

  Deno.exit(0);
});

let layoutChanged = false;

host.reactOrdered("zen.toggle", 1000, () => layoutChanged = true);

await host.emitStart({ version });
host.emitSetTheme("Default");

if (typeof args._[0] === "string") {
  await host.doc.open(args._[0]);
}

await host.runInputLoop((ctx) => {
  if (layoutChanged) {
    ctx.layoutChanged = true;
    layoutChanged = false;
  }
});

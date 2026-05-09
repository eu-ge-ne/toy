import { parseArgs } from "@std/cli/parse-args";

import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";
import * as alert from "@plugins/alert";
import * as ask from "@plugins/ask";
import * as askFileName from "@plugins/ask-file-name";
import * as debug from "@plugins/debug";
import * as editor from "@plugins/editor";
import * as files from "@plugins/files";
import * as footer from "@plugins/footer";
import * as header from "@plugins/header";
import * as palette from "@plugins/palette";
import * as shortcuts from "@plugins/shortcuts";

import deno from "../deno.json" with { type: "json" };

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

const host = new plugins.Host();

alert.register(host);
ask.register(host);
askFileName.register(host);
debug.register(host);
editor.register(host);
files.register(host);
footer.register(host);
header.register(host);
palette.register(host);
shortcuts.register(host);

Deno.addSignalListener("SIGWINCH", () => {
  host.resize();
  host.render();
});

host.onIntercept("start", async () => {
  globalThis.addEventListener("unhandledrejection", (e) => host.emitStop(e));

  vt.init();
});

host.onIntercept("stop", ({ e }) => {
  vt.restore();

  if (e) {
    console.log(e.reason);
  }

  Deno.exit(0);
}, 1000);

let layoutChanged = false;

host.onIntercept("command", async ({ cmd }) => {
  switch (cmd.name) {
    case "Exit":
      await host.emitStop();
      return;

    case "Save":
      await host.files.save();
      return;

    case "Zen":
      layoutChanged = true;
      return;
  }
}, 1000);

await host.emitStart({ version });
await host.command({ name: "Theme", data: "Default" });

if (typeof args._[0] === "string") {
  await host.files.open(args._[0]);
}

await host.loop((ctx) => {
  if (layoutChanged) {
    ctx.layoutChanged = true;
    layoutChanged = false;
  }
});

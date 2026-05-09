import { parseArgs } from "@std/cli/parse-args";

import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";
import alert from "@plugins/alert";
import ask from "@plugins/ask";
import askFileName from "@plugins/ask-file-name";
import debug from "@plugins/debug";
import editor from "@plugins/editor";
import files from "@plugins/files";
import footer from "@plugins/footer";
import header from "@plugins/header";
import palette from "@plugins/palette";
import shortcuts from "@plugins/shortcuts";

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

host.register(alert);
host.register(ask);
host.register(askFileName);
host.register(debug);
host.register(editor);

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
await host.emitCommand({ name: "Theme", data: "Default" });

if (typeof args._[0] === "string") {
  await host.files.open(args._[0]);
}

await host.loop((ctx) => {
  if (layoutChanged) {
    ctx.layoutChanged = true;
    layoutChanged = false;
  }
});

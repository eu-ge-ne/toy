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

host.onIntercept("start", async () => {
  globalThis.addEventListener("unhandledrejection", (e) => host.stop(e));

  vt.init();

  Deno.addSignalListener("SIGWINCH", () => {
    host.resize();
    host.render();
  });
});

host.onIntercept("stop.after", ({ e }) => {
  vt.restore();

  if (e) {
    console.log(e.reason);
  }

  Deno.exit(0);
});

let renderStarted = 0;

host.onReact("render.before", () => {
  renderStarted = performance.now();

  vt.sync.bsu();
  vt.buf.write(vt.cursor.hide);
});

host.onReact("render.after", () => {
  vt.buf.write(vt.cursor.show);
  vt.buf.flush();
  vt.sync.esu();

  host.debugRender(performance.now() - renderStarted);
});

host.onIntercept("command", async ({ cmd }) => {
  switch (cmd.name) {
    case "Exit":
      await host.stop();
      return;

    case "Save":
      await host.files.save();
      return;
  }
});

host.start();
host.resize();
host.debugVersion(version);

await host.command({ name: "Theme", data: "Default" });

if (typeof args._[0] === "string") {
  await host.files.open(args._[0]);
}

while (true) {
  host.render();

  const key = await vt.readKey();

  await host.keyPress(key);
}

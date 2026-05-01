import { parseArgs } from "@std/cli/parse-args";

import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";
import { AlertPlugin } from "@plugins/alert";
import { AskPlugin } from "@plugins/ask";
import { AskFileNamePlugin } from "@plugins/ask-file-name";
import { CommandsPlugin } from "@plugins/commands";
import { DebugPlugin } from "@plugins/debug";
import { EditorPlugin } from "@plugins/editor";
import { FilesPlugin } from "@plugins/files";
import { FooterPlugin } from "@plugins/footer";
import { HeaderPlugin } from "@plugins/header";
import { PalettePlugin } from "@plugins/palette";

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

host.on("start", () => {
  globalThis.addEventListener("unhandledrejection", (e) => host.stop(e));

  vt.init();

  Deno.addSignalListener("SIGWINCH", () => {
    host.resize();
    host.render();
  });
});

host.on("afterStop", (e) => {
  vt.restore();

  if (e) {
    console.log(e.reason);
  }

  Deno.exit(0);
});

let renderStarted = 0;

host.on("beforeRender", () => {
  renderStarted = performance.now();

  vt.sync.bsu();
  vt.buf.write(vt.cursor.hide);
});

host.on("afterRender", () => {
  vt.buf.write(vt.cursor.show);
  vt.buf.flush();
  vt.sync.esu();

  host.emitDebug({ renderElapsed: performance.now() - renderStarted });
});

host.register(
  new CommandsPlugin(host),
  new DebugPlugin(host),
  new HeaderPlugin(host),
  new FooterPlugin(host),
  new PalettePlugin(host),
);

host.registerAlert(new AlertPlugin(host));
host.registerAsk(new AskPlugin(host));
host.registerAskFileName(new AskFileNamePlugin(host));
host.registerFiles(new FilesPlugin(host));
host.registerDoc(new EditorPlugin(host));

host.start();
host.resize();

await host.emitCommand({ name: "Theme", data: "Default" });

host.emitDebug({ version });

if (typeof args._[0] === "string") {
  await host.files.open(args._[0]);
}

while (true) {
  host.render();

  const key = await vt.readKey();

  await host.emitKey(key);
}

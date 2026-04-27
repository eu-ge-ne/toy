import { parseArgs } from "@std/cli/parse-args";

import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";
import { AlertPlugin } from "@plugins/alert";
import { AskPlugin } from "@plugins/ask";
import { AskFileNamePlugin } from "@plugins/ask-file-name";
import { CommandsPlugin } from "@plugins/commands";
import { DebugPlugin } from "@plugins/debug";
import { EditorPlugin } from "@plugins/editor";
import { ExitPlugin } from "@plugins/exit";
import { FilesPlugin } from "@plugins/files";
import { FooterPlugin } from "@plugins/footer";
import { HeaderPlugin } from "@plugins/header";
import { PalettePlugin } from "@plugins/palette";
import { VTPlugin } from "@plugins/vt";

import deno from "../deno.json" with { type: "json" };

export const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(`toy ${deno.version} (deno ${Deno.version.deno})`);
  Deno.exit();
}

const host = new plugins.Host();

host.register(
  new VTPlugin(host),
  new ExitPlugin(host),
  new FilesPlugin(host),
  new CommandsPlugin(host),
  new HeaderPlugin(host),
  new FooterPlugin(host),
  new EditorPlugin(host),
  new DebugPlugin(host),
  new PalettePlugin(host),
);

host.registerAlert(new AlertPlugin(host));
host.registerAsk(new AskPlugin(host));
host.registerAskFileName(new AskFileNamePlugin(host));

await host.emitStart();
host.emitResize();

await host.emitCommand({ name: "Theme", data: "Default" });

if (typeof args._[0] === "string") {
  await host.fileOpen(args._[0]);
}

while (true) {
  host.emitRender();

  const key = await vt.readKey();

  await host.emitKey(key);
}

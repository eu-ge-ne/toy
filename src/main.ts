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
  new AskPlugin(host),
  new AlertPlugin(host),
  new PalettePlugin(host),
  new AskFileNamePlugin(host),
);

await host.start();
host.resize();

await host.command({ name: "Theme", data: "Default" });

if (typeof args._[0] === "string") {
  await host.fileOpen(args._[0]);
}

while (true) {
  host.render();

  const key = await vt.readKey();

  await host.keyPress(key);
}

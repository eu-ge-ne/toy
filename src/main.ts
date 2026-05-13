import { parseArgs } from "@std/cli/parse-args";

import AboutPlugin from "@plugins/about";
import AlertModalPlugin from "@plugins/alert-modal";
import ConfirmModalPlugin from "@plugins/confirm-modal";
import DebugPlugin from "@plugins/debug";
import DocPlugin from "@plugins/doc";
import FileNameModalPlugin from "@plugins/file-name-modal";
import FooterPlugin from "@plugins/footer";
import HeaderPlugin from "@plugins/header";
import IOPlugin from "@plugins/io";
import PaletteModalPlugin from "@plugins/palette-modal";
import RuntimePlugin from "@plugins/runtime";
import ShortcutsPlugin from "@plugins/shortcuts";
import ThemePlugin from "@plugins/theme";
import ZenPlugin from "@plugins/zen";

import { Host } from "./host.ts";

const host = new Host();
host.register(new AboutPlugin());
host.register(new AlertModalPlugin());
host.register(new ConfirmModalPlugin());
host.register(new DebugPlugin());
host.register(new DocPlugin());
host.register(new FileNameModalPlugin());
host.register(new FooterPlugin());
host.register(new HeaderPlugin());
host.register(new IOPlugin());
host.register(new PaletteModalPlugin());
host.register(new RuntimePlugin());
host.register(new ShortcutsPlugin());
host.register(new ThemePlugin());
host.register(new ZenPlugin());

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

host.zen.reactOrdered("toggle", 1000, () => layoutChanged = true);

if (typeof args._[0] === "string") {
  await host.doc.open(args._[0]);
}

await host.io.runLoop((ctx) => {
  if (layoutChanged) {
    ctx.layoutChanged = true;
    layoutChanged = false;
  }
});

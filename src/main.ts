import { parseArgs } from "@std/cli/parse-args";

import * as plugins from "@libs/plugins";
import * as std from "@libs/std";

import { AlertPlugin } from "@plugins/alert";
import { BufferPlugin } from "@plugins/buffer";
import { ConfirmPlugin } from "@plugins/confirm";
import { CorePlugin } from "@plugins/core";
import { DebugPlugin } from "@plugins/debug";
import { FilePlugin } from "@plugins/file";
import { FooterPlugin } from "@plugins/footer";
import { HeaderPlugin } from "@plugins/header";
import { PalettePlugin } from "@plugins/palette";
import { SaveAsPlugin } from "@plugins/save-as";
import { ShortcutsPlugin } from "@plugins/shortcuts";
import { ThemesPlugin } from "@plugins/themes";
import { ViewPlugin } from "@plugins/view";
import { ZenPlugin } from "@plugins/zen";

const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(std.version);
  Deno.exit();
}

const api = new plugins.Loader()
  .use(CorePlugin)
  .use(BufferPlugin)
  .use(ThemesPlugin)
  .use(AlertPlugin)
  .use(ConfirmPlugin)
  .use(SaveAsPlugin)
  .use(FilePlugin)
  .use(ZenPlugin)
  .use(ViewPlugin)
  .use(FooterPlugin)
  .use(HeaderPlugin)
  .use(DebugPlugin)
  .use(PalettePlugin)
  .use(ShortcutsPlugin)
  .load();

await api.core.start();

api.theme.set("Mauve");

if (typeof args._[0] === "string") {
  await api.file.open(args._[0]);
}

api.core.events.on("stop", -1000)(async ({ e }) => {
  if (!e && api.buffer.modified) {
    if (await api.confirm.open("Save changes?")) {
      await api.file.save();
    }
  }
});

await api.core.loop(() => {});

import { parseArgs } from "@std/cli/parse-args";

import * as plugins from "@libs/plugins";
import * as std from "@libs/std";

import * as alert from "@plugins/alert";
import * as buffer from "@plugins/buffer";
import * as confirm from "@plugins/confirm";
import * as core from "@plugins/core";
import * as debug from "@plugins/debug";
import * as file from "@plugins/file";
import * as footer from "@plugins/footer";
import * as header from "@plugins/header";
import * as palette from "@plugins/palette";
import * as saveAs from "@plugins/save-as";
import * as shortcuts from "@plugins/shortcuts";
import * as themes from "@plugins/themes";
import * as view from "@plugins/view";
import * as zen from "@plugins/zen";

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
  .use(core.Plugin)
  .use(buffer.Plugin)
  .use(themes.Plugin)
  .use(alert.Plugin)
  .use(confirm.Plugin)
  .use(saveAs.Plugin)
  .use(file.Plugin)
  .use(zen.Plugin)
  .use(view.Plugin)
  .use(footer.Plugin)
  .use(header.Plugin)
  .use(debug.Plugin)
  .use(palette.Plugin)
  .use(shortcuts.Plugin)
  .api;

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

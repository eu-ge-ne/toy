import { parseArgs } from "@std/cli/parse-args";

import { Toy } from "@libs/toy";
import * as version from "@libs/version";

export const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(version.version);
  Deno.exit();
}

const toy = await Toy.load();

await toy.runtime.start();
toy.theme.set("Default");

let layoutChanged = false;

toy.zen.signals.on("toggle", 1000)(() => layoutChanged = true);

if (typeof args._[0] === "string") {
  await toy.doc.open(args._[0]);
}

await toy.io.loop((ctx) => {
  if (layoutChanged) {
    ctx.layoutChanged = true;
    layoutChanged = false;
  }
});

import { parseArgs } from "@std/cli/parse-args";

import { Toy } from "./toy.ts";

const toy = await Toy.load();

export const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(toy.about.version);
  Deno.exit();
}

toy.init();

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

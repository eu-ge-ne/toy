import { parseArgs } from "@std/cli/parse-args";

import * as std from "@libs/std";
import { Toy } from "@libs/toy";

export const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(std.version);
  Deno.exit();
}

const toy = await Toy.load();

await toy.runtime.start();

toy.theme.set("Default");

if (typeof args._[0] === "string") {
  await toy.doc.open(args._[0]);
}

toy.io.resize();

await toy.io.loop(() => {});

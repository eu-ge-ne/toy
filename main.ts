import { parseArgs } from "@std/cli/parse-args";

import { App } from "@toy/app";

import deno from "./deno.json" with { type: "json" };

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

const fileName = typeof args._[0] === "string" ? args._[0] : undefined;

new App().run(fileName);

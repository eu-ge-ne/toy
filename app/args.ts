import { parseArgs } from "@std/cli/parse-args";

export const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

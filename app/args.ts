import { parseArgs } from "@std/cli/parse-args";

export const args = parseArgs(Deno.args, {
  boolean: ["version", "old"],
  alias: {
    version: "v",
  },
});

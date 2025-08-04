import { parseArgs } from "@std/cli/parse-args";

// deno-lint-ignore explicit-function-return-type explicit-module-boundary-types
export function args() {
  return parseArgs(Deno.args, {
    boolean: ["version", "old"],
    alias: {
      version: "v",
    },
  });
}

import { assertParse } from "./assert.ts";

Deno.test("a", () => {
  assertParse("a", [{ name: "a", text: "a" }, 1]);
});

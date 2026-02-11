import { assert_parse } from "./assert.ts";

Deno.test("a", () => {
  assert_parse("a", [{ name: "a", text: "a" }, 1]);
});

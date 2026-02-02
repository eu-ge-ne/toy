import { assert_parse, create_key } from "./assert.ts";

Deno.test("a", () => {
  assert_parse("a", [create_key({ name: "a", text: "a" }), 1]);
});

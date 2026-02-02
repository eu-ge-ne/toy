import { assert_parse } from "./assert.ts";

Deno.test("CSI ? flags u", () => {
  assert_parse("\x1b[?31u", undefined);
});

Deno.test("CSI 1 z", () => {
  assert_parse("\x1b[1z", undefined);
});

Deno.test("CSI 1", () => {
  assert_parse("\x1b[1", undefined);
});

Deno.test("CSI", () => {
  assert_parse("\x1b[", undefined);
});

import { assertParse } from "./assert.ts";

Deno.test("empty", () => {
  assertParse("", undefined);
});

Deno.test("CSI ? flags u", () => {
  assertParse("\x1b[?31u", undefined);
});

Deno.test("CSI 1 z", () => {
  assertParse("\x1b[1z", undefined);
});

Deno.test("CSI 1", () => {
  assertParse("\x1b[1", undefined);
});

Deno.test("CSI", () => {
  assertParse("\x1b[", undefined);
});

Deno.test("CSI u", () => {
  assertParse("\x1b[u", [{ name: "\x1b[u" }, 3]);
});

import { assertParse } from "./assert.ts";

Deno.test("ESC", () => {
  assertParse("\x1b", [{ name: "ESC" }, 1]);
});

Deno.test("ENTER", () => {
  assertParse("\x0d", [{ name: "ENTER" }, 1]);
});

Deno.test("TAB", () => {
  assertParse("\x09", [{ name: "TAB" }, 1]);
});

Deno.test("DEL", () => {
  assertParse("\x7f", [{ name: "BACKSPACE" }, 1]);
});

Deno.test("BS", () => {
  assertParse("\x08", [{ name: "BACKSPACE" }, 1]);
});

import { Key } from "../key.ts";
import { assertParse } from "./assert.ts";

Deno.test("INSERT", () => {
  const key: Key = {
    name: "INSERT",
    keyCode: 2,
  };

  assertParse("\x1b[2~", [key, 4]);

  assertParse("\x1b[2;5~", [{ ...key, ctrl: true }, 6]);
  assertParse("\x1b[2;3~", [{ ...key, alt: true }, 6]);
  assertParse("\x1b[2;2~", [{ ...key, shift: true }, 6]);

  assertParse("\x1b[2;1:1~", [key, 8]);
  assertParse("\x1b[2;1:2~", [{ ...key, event: "repeat" }, 8]);
  assertParse("\x1b[2;1:3~", [{ ...key, event: "release" }, 8]);
});

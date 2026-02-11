import { Key } from "../key.ts";
import { assert_parse } from "./assert.ts";

Deno.test("INSERT", () => {
  const key: Key = {
    name: "INSERT",
    keyCode: 2,
  };

  assert_parse("\x1b[2~", [key, 4]);

  assert_parse("\x1b[2;5~", [{ ...key, ctrl: true }, 6]);
  assert_parse("\x1b[2;3~", [{ ...key, alt: true }, 6]);
  assert_parse("\x1b[2;2~", [{ ...key, shift: true }, 6]);

  assert_parse("\x1b[2;1:1~", [key, 8]);
  assert_parse("\x1b[2;1:2~", [{ ...key, event: "repeat" }, 8]);
  assert_parse("\x1b[2;1:3~", [{ ...key, event: "release" }, 8]);
});

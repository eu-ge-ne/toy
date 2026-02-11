import { Key } from "../key.ts";
import { assert_parse } from "./assert.ts";

Deno.test("ESC", () => {
  const key: Key = {
    name: "ESC",
    keyCode: 27,
  };

  assert_parse("\x1b[27u", [key, 5]);

  assert_parse("\x1b[27;5u", [{ ...key, ctrl: true }, 7]);
  assert_parse("\x1b[27;3u", [{ ...key, alt: true }, 7]);
  assert_parse("\x1b[27;2u", [{ ...key, shift: true }, 7]);

  assert_parse("\x1b[27;1:1u", [key, 9]);
  assert_parse("\x1b[27;1:2u", [{ ...key, event: "repeat" }, 9]);
  assert_parse("\x1b[27;1:3u", [{ ...key, event: "release" }, 9]);
});

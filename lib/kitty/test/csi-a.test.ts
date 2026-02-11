import { Key } from "../key.ts";
import { assert_parse } from "./assert.ts";

Deno.test("LEFT", () => {
  const key: Key = {
    name: "LEFT",
    keyCode: 1,
  };

  assert_parse("\x1b[1D", [key, 4]);

  assert_parse("\x1b[1;5D", [{ ...key, ctrl: true }, 6]);
  assert_parse("\x1b[1;3D", [{ ...key, alt: true }, 6]);
  assert_parse("\x1b[1;2D", [{ ...key, shift: true }, 6]);

  assert_parse("\x1b[1;1:1D", [key, 8]);
  assert_parse("\x1b[1;1:2D", [{ ...key, event: "repeat" }, 8]);
  assert_parse("\x1b[1;1:3D", [{ ...key, event: "release" }, 8]);
});

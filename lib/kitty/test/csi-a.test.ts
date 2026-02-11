import { Key } from "../key.ts";
import { assertParse } from "./assert.ts";

Deno.test("LEFT", () => {
  const key: Key = {
    name: "LEFT",
    keyCode: 1,
  };

  assertParse("\x1b[1D", [key, 4]);

  assertParse("\x1b[1;5D", [{ ...key, ctrl: true }, 6]);
  assertParse("\x1b[1;3D", [{ ...key, alt: true }, 6]);
  assertParse("\x1b[1;2D", [{ ...key, shift: true }, 6]);

  assertParse("\x1b[1;1:1D", [key, 8]);
  assertParse("\x1b[1;1:2D", [{ ...key, event: "repeat" }, 8]);
  assertParse("\x1b[1;1:3D", [{ ...key, event: "release" }, 8]);
});

import { Key } from "../key.ts";
import { assertParse } from "./assert.ts";

Deno.test("a", () => {
  const key: Key = {
    name: "a",
    keyCode: 97,
  };

  assertParse("\x1b[97;;97u", [{ ...key, text: "a" }, 9]);

  assertParse("\x1b[97;3u", [{ ...key, alt: true }, 7]);
  assertParse("\x1b[97;5u", [{ ...key, ctrl: true }, 7]);
  assertParse("\x1b[97;9u", [{ ...key, super: true }, 7]);
  assertParse("\x1b[97;65u", [{ ...key, capsLock: true }, 8]);
  assertParse("\x1b[97;129u", [{ ...key, numLock: true }, 9]);

  assertParse("\x1b[97;1:1u", [key, 9]);
  assertParse("\x1b[97;1:2u", [{ ...key, event: "repeat" }, 9]);
  assertParse("\x1b[97;1:3u", [{ ...key, event: "release" }, 9]);
});

Deno.test("A", () => {
  assertParse("\x1b[97:65;2;65u", [
    {
      name: "a",
      keyCode: 97,
      shiftCode: 65,
      text: "A",
      shift: true,
    },
    13,
  ]);
});

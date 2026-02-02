import { assert_parse, create_key } from "./assert.ts";

Deno.test("LEFT", () => {
  const key = create_key({
    name: "LEFT",
    code: { key: 1, shift: undefined, base: undefined },
  });

  assert_parse("\x1b[1D", [key, 4]);

  assert_parse("\x1b[1;5D", [create_key(key, { ctrl: true }), 6]);
  assert_parse("\x1b[1;3D", [create_key(key, { alt: true }), 6]);
  assert_parse("\x1b[1;2D", [create_key(key, { shift: true }), 6]);

  assert_parse("\x1b[1;1:1D", [key, 8]);
  assert_parse("\x1b[1;1:2D", [create_key(key, { event: "repeat" }), 8]);
  assert_parse("\x1b[1;1:3D", [create_key(key, { event: "release" }), 8]);
});

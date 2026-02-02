import { assert_parse, create_key } from "./assert.ts";

Deno.test("INSERT", () => {
  const key = create_key({
    name: "INSERT",
    code: { key: 2, shift: undefined, base: undefined },
  });

  assert_parse("\x1b[2~", [key, 4]);

  assert_parse("\x1b[2;5~", [create_key(key, { ctrl: true }), 6]);
  assert_parse("\x1b[2;3~", [create_key(key, { alt: true }), 6]);
  assert_parse("\x1b[2;2~", [create_key(key, { shift: true }), 6]);

  assert_parse("\x1b[2;1:1~", [key, 8]);
  assert_parse("\x1b[2;1:2~", [create_key(key, { event: "repeat" }), 8]);
  assert_parse("\x1b[2;1:3~", [create_key(key, { event: "release" }), 8]);
});

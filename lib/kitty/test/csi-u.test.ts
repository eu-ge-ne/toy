import { assert_parse, create_key } from "./assert.ts";

Deno.test("ESC", () => {
  const key = create_key({
    name: "ESC",
    code: { key: 27, shift: undefined, base: undefined },
  });

  assert_parse("\x1b[27u", [key, 5]);

  assert_parse("\x1b[27;5u", [create_key(key, { ctrl: true }), 7]);
  assert_parse("\x1b[27;3u", [create_key(key, { alt: true }), 7]);
  assert_parse("\x1b[27;2u", [create_key(key, { shift: true }), 7]);

  assert_parse("\x1b[27;1:1u", [key, 9]);
  assert_parse("\x1b[27;1:2u", [create_key(key, { event: "repeat" }), 9]);
  assert_parse("\x1b[27;1:3u", [create_key(key, { event: "release" }), 9]);
});

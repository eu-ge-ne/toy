import { assert_parse, create_key } from "./assert.ts";

Deno.test("a", () => {
  const key = create_key({
    name: "a",
    code: { key: 97, shift: undefined, base: undefined },
  });

  assert_parse("\x1b[97;;97u", [create_key(key, { text: "a" }), 9]);

  assert_parse("\x1b[97;3u", [create_key(key, { alt: true }), 7]);
  assert_parse("\x1b[97;5u", [create_key(key, { ctrl: true }), 7]);
  assert_parse("\x1b[97;9u", [create_key(key, { super: true }), 7]);
  assert_parse("\x1b[97;65u", [create_key(key, { caps_lock: true }), 8]);
  assert_parse("\x1b[97;129u", [create_key(key, { num_lock: true }), 9]);

  assert_parse("\x1b[97;1:1u", [key, 9]);
  assert_parse("\x1b[97;1:2u", [create_key(key, { event: "repeat" }), 9]);
  assert_parse("\x1b[97;1:3u", [create_key(key, { event: "release" }), 9]);
});

Deno.test("A", () => {
  assert_parse("\x1b[97:65;2;65u", [
    create_key({
      name: "a",
      code: {
        key: 97,
        shift: 65,
        base: undefined,
      },
      event: "press",
      text: "A",
      shift: true,
      alt: false,
      ctrl: false,
      super: false,
      caps_lock: false,
      num_lock: false,
    }),
    13,
  ]);
});

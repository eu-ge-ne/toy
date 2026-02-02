import { assert_parse, create_key } from "./assert.ts";

Deno.test("1 Disambiguate escape codes", () => {
  assert_parse("\x1b[27u", [
    create_key({
      name: "ESC",
      code: { key: 27, shift: undefined, base: undefined },
    }),
    5,
  ]);

  assert_parse("\x1b[1078;8u", [
    create_key({
      name: "ж",
      code: { key: 1078, shift: undefined, base: undefined },
      shift: true,
      alt: true,
      ctrl: true,
    }),
    9,
  ]);
});

Deno.test("1 + 4 Report alternate keys", () => {
  assert_parse("\x1b[1078:1046:59;8u", [
    create_key({
      name: "ж",
      code: {
        key: 1078,
        shift: 1046,
        base: 59,
      },
      shift: true,
      alt: true,
      ctrl: true,
    }),
    17,
  ]);
});

Deno.test("1 + 4 + 8 Report all keys as escape codes", () => {
  assert_parse("\x1b[1078u", [
    create_key({
      name: "ж",
      code: { key: 1078, shift: undefined, base: undefined },
    }),
    7,
  ]);
});

Deno.test("1 + 4 + 8 + 16 Report associated text", () => {
  assert_parse("\x1b[1078:1046:59;2;1046u", [
    create_key({
      name: "ж",
      code: {
        key: 1078,
        shift: 1046,
        base: 59,
      },
      text: "Ж",
      shift: true,
    }),
    22,
  ]);
});

Deno.test("1 + 4 + 8 + 16 + 2 Report event types", () => {
  assert_parse("\x1b[1078:1046:59;2:1;1046u", [
    create_key({
      name: "ж",
      code: {
        key: 1078,
        shift: 1046,
        base: 59,
      },
      text: "Ж",
      shift: true,
    }),
    24,
  ]);

  assert_parse("\x1b[1078:1046:59;2:2;1046u", [
    create_key({
      name: "ж",
      code: {
        key: 1078,
        shift: 1046,
        base: 59,
      },
      event: "repeat",
      text: "Ж",
      shift: true,
    }),
    24,
  ]);

  assert_parse("\x1b[1078::59;2:3u", [
    create_key({
      name: "ж",
      code: {
        key: 1078,
        shift: undefined,
        base: 59,
      },
      event: "release",
      shift: true,
    }),
    15,
  ]);
});

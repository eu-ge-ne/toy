import { assert_parse, create_key } from "./assert.ts";

Deno.test("1 Disambiguate escape codes", () => {
  assert_parse("\x1b[27u", [
    create_key({
      name: "ESC",
      keyCode: 27,
      shiftCode: undefined,
      baseCode: undefined,
    }),
    5,
  ]);

  assert_parse("\x1b[1078;8u", [
    create_key({
      name: "ж",
      keyCode: 1078,
      shiftCode: undefined,
      baseCode: undefined,
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
      keyCode: 1078,
      shiftCode: 1046,
      baseCode: 59,
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
      keyCode: 1078,
      shiftCode: undefined,
      baseCode: undefined,
    }),
    7,
  ]);
});

Deno.test("1 + 4 + 8 + 16 Report associated text", () => {
  assert_parse("\x1b[1078:1046:59;2;1046u", [
    create_key({
      name: "ж",
      keyCode: 1078,
      shiftCode: 1046,
      baseCode: 59,
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
      keyCode: 1078,
      shiftCode: 1046,
      baseCode: 59,
      text: "Ж",
      shift: true,
    }),
    24,
  ]);

  assert_parse("\x1b[1078:1046:59;2:2;1046u", [
    create_key({
      name: "ж",
      keyCode: 1078,
      shiftCode: 1046,
      baseCode: 59,
      event: "repeat",
      text: "Ж",
      shift: true,
    }),
    24,
  ]);

  assert_parse("\x1b[1078::59;2:3u", [
    create_key({
      name: "ж",
      keyCode: 1078,
      shiftCode: undefined,
      baseCode: 59,
      event: "release",
      shift: true,
    }),
    15,
  ]);
});

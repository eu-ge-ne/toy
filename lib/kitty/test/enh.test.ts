import { assertParse } from "./assert.ts";

Deno.test("1 Disambiguate escape codes", () => {
  assertParse("\x1b[27u", [{ name: "ESC", keyCode: 27 }, 5]);

  assertParse("\x1b[1078;8u", [
    {
      name: "ж",
      keyCode: 1078,
      shift: true,
      alt: true,
      ctrl: true,
    },
    9,
  ]);
});

Deno.test("1 + 4 Report alternate keys", () => {
  assertParse("\x1b[1078:1046:59;8u", [
    {
      name: "ж",
      keyCode: 1078,
      shiftCode: 1046,
      baseCode: 59,
      shift: true,
      alt: true,
      ctrl: true,
    },
    17,
  ]);
});

Deno.test("1 + 4 + 8 Report all keys as escape codes", () => {
  assertParse("\x1b[1078u", [{ name: "ж", keyCode: 1078 }, 7]);
});

Deno.test("1 + 4 + 8 + 16 Report associated text", () => {
  assertParse("\x1b[1078:1046:59;2;1046u", [
    {
      name: "ж",
      keyCode: 1078,
      shiftCode: 1046,
      baseCode: 59,
      text: "Ж",
      shift: true,
    },
    22,
  ]);
});

Deno.test("1 + 4 + 8 + 16 + 2 Report event types", () => {
  assertParse("\x1b[1078:1046:59;2:1;1046u", [
    {
      name: "ж",
      keyCode: 1078,
      shiftCode: 1046,
      baseCode: 59,
      text: "Ж",
      shift: true,
    },
    24,
  ]);

  assertParse("\x1b[1078:1046:59;2:2;1046u", [
    {
      name: "ж",
      keyCode: 1078,
      shiftCode: 1046,
      baseCode: 59,
      event: "repeat",
      text: "Ж",
      shift: true,
    },
    24,
  ]);

  assertParse("\x1b[1078::59;2:3u", [
    {
      name: "ж",
      keyCode: 1078,
      baseCode: 59,
      event: "release",
      shift: true,
    },
    15,
  ]);
});

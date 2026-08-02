import {
  assertParseFlags,
  assertPopFlags,
  assertPushFlags,
  assertSetFlags,
} from "./assert.ts";

import { FlagsMode } from "../flags.ts";

Deno.test("set disambiguate", () => {
  assertSetFlags({ disambiguate: true }, FlagsMode.Set, "\x1b[=1;1u");
});

Deno.test("set events", () => {
  assertSetFlags({ events: true }, FlagsMode.Set, "\x1b[=2;1u");
});

Deno.test("set alternates", () => {
  assertSetFlags({ alternates: true }, FlagsMode.Set, "\x1b[=4;1u");
});

Deno.test("set all_keys", () => {
  assertSetFlags({ allKeys: true }, FlagsMode.Set, "\x1b[=8;1u");
});

Deno.test("set text", () => {
  assertSetFlags({ text: true }, FlagsMode.Set, "\x1b[=16;1u");
});

Deno.test("set", () => {
  assertSetFlags({}, FlagsMode.Set, "\x1b[=0;1u");
});

Deno.test("update", () => {
  assertSetFlags({}, FlagsMode.Update, "\x1b[=0;2u");
});

Deno.test("reset", () => {
  assertSetFlags({}, FlagsMode.Reset, "\x1b[=0;3u");
});

Deno.test("push disambiguate", () => {
  assertPushFlags({ disambiguate: true }, "\x1b[>1u");
});

Deno.test("push events", () => {
  assertPushFlags({ events: true }, "\x1b[>2u");
});

Deno.test("push alternates", () => {
  assertPushFlags({ alternates: true }, "\x1b[>4u");
});

Deno.test("push all_keys", () => {
  assertPushFlags({ allKeys: true }, "\x1b[>8u");
});

Deno.test("push text", () => {
  assertPushFlags({ text: true }, "\x1b[>16u");
});

Deno.test("pop", () => {
  assertPopFlags(1, "\x1b[<1u");
});

Deno.test("parse disambiguate", () => {
  assertParseFlags("\x1b[?1u", { disambiguate: true });
});

Deno.test("parse events", () => {
  assertParseFlags("\x1b[?2u", { events: true });
});

Deno.test("parse alternates", () => {
  assertParseFlags("\x1b[?4u", { alternates: true });
});

Deno.test("parse all_keys", () => {
  assertParseFlags("\x1b[?8u", { allKeys: true });
});

Deno.test("parse text", () => {
  assertParseFlags("\x1b[?16u", { text: true });
});

Deno.test("parse invalid flags", () => {
  assertParseFlags("\x1b[?xu", undefined);
});

Deno.test("parse invalid prefix", () => {
  assertParseFlags("\x1b[1u", undefined);
});

Deno.test("parse invalid postfix", () => {
  assertParseFlags("\x1b[?1x", undefined);
});

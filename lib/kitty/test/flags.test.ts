import {
  assert_parse_flags,
  assert_pop_flags,
  assert_push_flags,
  assert_set_flags,
} from "./assert.ts";

import { FlagsMode } from "../flags.ts";

Deno.test("set disambiguate", () => {
  assert_set_flags({ disambiguate: true }, FlagsMode.Set, "\x1b[=1;1u");
});

Deno.test("set events", () => {
  assert_set_flags({ events: true }, FlagsMode.Set, "\x1b[=2;1u");
});

Deno.test("set alternates", () => {
  assert_set_flags({ alternates: true }, FlagsMode.Set, "\x1b[=4;1u");
});

Deno.test("set all_keys", () => {
  assert_set_flags({ allKeys: true }, FlagsMode.Set, "\x1b[=8;1u");
});

Deno.test("set text", () => {
  assert_set_flags({ text: true }, FlagsMode.Set, "\x1b[=16;1u");
});

Deno.test("set", () => {
  assert_set_flags({}, FlagsMode.Set, "\x1b[=0;1u");
});

Deno.test("update", () => {
  assert_set_flags({}, FlagsMode.Update, "\x1b[=0;2u");
});

Deno.test("reset", () => {
  assert_set_flags({}, FlagsMode.Reset, "\x1b[=0;3u");
});

Deno.test("push disambiguate", () => {
  assert_push_flags({ disambiguate: true }, "\x1b[>1u");
});

Deno.test("push events", () => {
  assert_push_flags({ events: true }, "\x1b[>2u");
});

Deno.test("push alternates", () => {
  assert_push_flags({ alternates: true }, "\x1b[>4u");
});

Deno.test("push all_keys", () => {
  assert_push_flags({ allKeys: true }, "\x1b[>8u");
});

Deno.test("push text", () => {
  assert_push_flags({ text: true }, "\x1b[>16u");
});

Deno.test("pop", () => {
  assert_pop_flags(1, "\x1b[<1u");
});

Deno.test("parse disambiguate", () => {
  assert_parse_flags("\x1b[?1u", { disambiguate: true });
});

Deno.test("parse events", () => {
  assert_parse_flags("\x1b[?2u", { events: true });
});

Deno.test("parse alternates", () => {
  assert_parse_flags("\x1b[?4u", { alternates: true });
});

Deno.test("parse all_keys", () => {
  assert_parse_flags("\x1b[?8u", { allKeys: true });
});

Deno.test("parse text", () => {
  assert_parse_flags("\x1b[?16u", { text: true });
});

Deno.test("parse invalid flags", () => {
  assert_parse_flags("\x1b[?xu", undefined);
});

Deno.test("parse invalid prefix", () => {
  assert_parse_flags("\x1b[1u", undefined);
});

Deno.test("parse invalid postfix", () => {
  assert_parse_flags("\x1b[?1x", undefined);
});

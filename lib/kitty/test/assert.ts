import { assertEquals } from "@std/assert";

import {
  type Flags,
  type FlagsMode,
  parseFlags,
  popFlags,
  pushFlags,
  setFlags,
} from "../flags.ts";
import { Key, parse } from "../key.ts";

const enc = new TextEncoder();

export function assert_parse(
  actual: string,
  expected: [Key, number] | undefined,
): void {
  assertEquals(parse(enc.encode(actual)), expected);
}

export function assert_set_flags(
  flags: Flags,
  mode: FlagsMode,
  text: string,
): void {
  assertEquals(setFlags(flags, mode), new TextEncoder().encode(text));
}

export function assert_push_flags(
  flags: Flags,
  text: string,
): void {
  assertEquals(pushFlags(flags), new TextEncoder().encode(text));
}

export function assert_pop_flags(
  number: number,
  text: string,
): void {
  assertEquals(popFlags(number), new TextEncoder().encode(text));
}

export function assert_parse_flags(
  actual: string,
  expected: Flags | undefined,
): void {
  assertEquals(parseFlags(enc.encode(actual)), expected);
}

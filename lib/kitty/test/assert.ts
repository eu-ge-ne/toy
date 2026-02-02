import { assertEquals } from "@std/assert";

import {
  type Flags,
  type FlagsMode,
  Key,
  parse_flags,
  pop_flags,
  push_flags,
  set_flags,
} from "../mod.ts";

const encoder = new TextEncoder();

export function create_key(src0: Partial<Key>, src1?: Partial<Key>): Key {
  return Object.assign(new Key(), src0, src1);
}

export function assert_parse(
  actual: string,
  expected: [Key, number] | undefined,
): void {
  assertEquals(Key.parse(encoder.encode(actual)), expected);
}

export function assert_set_flags(
  flags: Flags,
  mode: FlagsMode,
  text: string,
): void {
  assertEquals(set_flags(flags, mode), new TextEncoder().encode(text));
}

export function assert_push_flags(
  flags: Flags,
  text: string,
): void {
  assertEquals(push_flags(flags), new TextEncoder().encode(text));
}

export function assert_pop_flags(
  number: number,
  text: string,
): void {
  assertEquals(pop_flags(number), new TextEncoder().encode(text));
}

export function assert_parse_flags(
  actual: string,
  expected: Flags | undefined,
): void {
  assertEquals(parse_flags(encoder.encode(actual)), expected);
}

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

export function assertParse(
  actual: string,
  expected: [Key, number] | undefined,
): void {
  assertEquals(parse(enc.encode(actual)), expected);
}

export function assertSetFlags(
  flags: Flags,
  mode: FlagsMode,
  text: string,
): void {
  assertEquals(setFlags(flags, mode), new TextEncoder().encode(text));
}

export function assertPushFlags(
  flags: Flags,
  text: string,
): void {
  assertEquals(pushFlags(flags), new TextEncoder().encode(text));
}

export function assertPopFlags(
  number: number,
  text: string,
): void {
  assertEquals(popFlags(number), new TextEncoder().encode(text));
}

export function assertParseFlags(
  actual: string,
  expected: Flags | undefined,
): void {
  assertEquals(parseFlags(enc.encode(actual)), expected);
}

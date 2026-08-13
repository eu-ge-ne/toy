import { assertEquals } from "@std/assert";

import { String2 } from "../string2.ts";

Deno.test("0 newlines", () => {
  const str1 = new String2("A");
  const str2 = new String2("😄");
  const str3 = new String2("🤦🏼‍♂️");

  assertEquals(str1.lineCount, 1);
  assertEquals(str2.lineCount, 1);
  assertEquals(str3.lineCount, 1);
});

Deno.test("LF", () => {
  const str1 = new String2("A\nA");
  const str2 = new String2("😄\n😄");
  const str3 = new String2("🤦🏼‍♂️\n🤦🏼‍♂️");

  assertEquals(str1.lineCount, 2);
  assertEquals(str2.lineCount, 2);
  assertEquals(str3.lineCount, 2);
});

Deno.test("CRLF", () => {
  const str1 = new String2("A\r\nA");
  const str2 = new String2("😄\r\n😄");
  const str3 = new String2("🤦🏼‍♂️\r\n🤦🏼‍♂️");

  assertEquals(str1.lineCount, 2);
  assertEquals(str2.lineCount, 2);
  assertEquals(str3.lineCount, 2);
});

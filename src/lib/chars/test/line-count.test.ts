import { assertEquals } from "@std/assert";

import { Buf } from "../buf.ts";

Deno.test("0 newlines", () => {
  const buf1 = new Buf("A");
  const buf2 = new Buf("😄");
  const buf3 = new Buf("🤦🏼‍♂️");

  assertEquals(buf1.lineCount, 1);
  assertEquals(buf2.lineCount, 1);
  assertEquals(buf3.lineCount, 1);
});

Deno.test("LF", () => {
  const buf1 = new Buf("A\nA");
  const buf2 = new Buf("😄\n😄");
  const buf3 = new Buf("🤦🏼‍♂️\n🤦🏼‍♂️");

  assertEquals(buf1.lineCount, 2);
  assertEquals(buf2.lineCount, 2);
  assertEquals(buf3.lineCount, 2);
});

Deno.test("CRLF", () => {
  const buf1 = new Buf("A\r\nA");
  const buf2 = new Buf("😄\r\n😄");
  const buf3 = new Buf("🤦🏼‍♂️\r\n🤦🏼‍♂️");

  assertEquals(buf1.lineCount, 2);
  assertEquals(buf2.lineCount, 2);
  assertEquals(buf3.lineCount, 2);
});

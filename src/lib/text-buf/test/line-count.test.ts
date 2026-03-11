import { assertEquals } from "@std/assert";

import { TextBuf } from "../text-buf.ts";

Deno.test("0 newlines", () => {
  const buf1 = new TextBuf("A");
  const buf2 = new TextBuf("😄");
  const buf3 = new TextBuf("🤦🏼‍♂️");

  assertEquals(buf1.lineCount, 1);
  assertEquals(buf2.lineCount, 1);
  assertEquals(buf3.lineCount, 1);
});

Deno.test("LF", () => {
  const buf1 = new TextBuf("A\nA");
  const buf2 = new TextBuf("😄\n😄");
  const buf3 = new TextBuf("🤦🏼‍♂️\n🤦🏼‍♂️");

  assertEquals(buf1.lineCount, 2);
  assertEquals(buf2.lineCount, 2);
  assertEquals(buf3.lineCount, 2);
});

Deno.test("CRLF", () => {
  const buf1 = new TextBuf("A\r\nA");
  const buf2 = new TextBuf("😄\r\n😄");
  const buf3 = new TextBuf("🤦🏼‍♂️\r\n🤦🏼‍♂️");

  assertEquals(buf1.lineCount, 2);
  assertEquals(buf2.lineCount, 2);
  assertEquals(buf3.lineCount, 2);
});

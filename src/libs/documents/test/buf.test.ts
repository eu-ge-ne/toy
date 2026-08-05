import { assertEquals, assertThrows } from "@std/assert";

import { Buf } from "../buf.ts";

Deno.test("Read", () => {
  const buf = new Buf("Lorem ipsum");

  assertEquals(buf.text.slice(5, 6), " ");
});

Deno.test("0 newlines", () => {
  const buf = new Buf("Lorem ipsum");

  assertEquals(buf.eols.length, 0);
  assertEquals([...buf.eols], []);
});

Deno.test("LF", () => {
  const buf = new Buf("Lorem \nipsum \n");

  assertEquals(buf.eols.length, 2);
  assertEquals([...buf.eols], [{ start: 6, end: 7 }, { start: 13, end: 14 }]);
});

Deno.test("CRLF", () => {
  const buf = new Buf("Lorem \r\nipsum \r\n");

  assertEquals(buf.eols.length, 2);
  assertEquals([...buf.eols], [{ start: 6, end: 8 }, { start: 14, end: 16 }]);
});

Deno.test("LF and CRLF", () => {
  const buf = new Buf("Lorem \nipsum \r\n");

  assertEquals(buf.eols.length, 2);
  assertEquals([...buf.eols], [{ start: 6, end: 7 }, { start: 13, end: 15 }]);
});

Deno.test("charToEolIndex", () => {
  const buf = new Buf("AA\r\nBB\nCC");

  assertEquals(buf.eols.length, 2);

  assertEquals(buf.charToLine(0), 0);
  assertEquals(buf.charToLine(1), 0);

  assertEquals(buf.charToLine(2), 0);
  assertThrows(() => buf.charToLine(3));

  assertEquals(buf.charToLine(4), 1);
  assertEquals(buf.charToLine(5), 1);

  assertEquals(buf.charToLine(6), 1);

  assertEquals(buf.charToLine(7), 2);
  assertEquals(buf.charToLine(8), 2);
});

Deno.test("findEolIndex_2", () => {
  const buf = new Buf("1\n2\n3\n4\n5");
  //                   01 23 45 67 8
  //                     0  1  2  3

  assertEquals(buf.eols.length, 4);

  assertEquals(buf.charToLine(0), 0);
  assertEquals(buf.charToLine(1), 0);
  assertEquals(buf.charToLine(2), 1);
  assertEquals(buf.charToLine(3), 1);
  assertEquals(buf.charToLine(4), 2);
  assertEquals(buf.charToLine(5), 2);
  assertEquals(buf.charToLine(6), 3);
  assertEquals(buf.charToLine(7), 3);
  assertEquals(buf.charToLine(8), 4);
  assertEquals(buf.charToLine(8), 4);
});

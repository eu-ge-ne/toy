import { assertEquals, assertThrows } from "@std/assert";

import { TextBuffer } from "../text-buffer.ts";

Deno.test("Read", () => {
  const buf = new TextBuffer("Lorem ipsum");

  assertEquals(buf.text.slice(5, 6), " ");
});

Deno.test("0 newlines", () => {
  const buf = new TextBuffer("Lorem ipsum");

  assertEquals(buf.eols.length, 0);
  assertEquals([...buf.eols], []);
});

Deno.test("LF", () => {
  const buf = new TextBuffer("Lorem \nipsum \n");

  assertEquals(buf.eols.length, 2);
  assertEquals([...buf.eols], [{ start: 6, end: 7 }, { start: 13, end: 14 }]);
});

Deno.test("CRLF", () => {
  const buf = new TextBuffer("Lorem \r\nipsum \r\n");

  assertEquals(buf.eols.length, 2);
  assertEquals([...buf.eols], [{ start: 6, end: 8 }, { start: 14, end: 16 }]);
});

Deno.test("LF and CRLF", () => {
  const buf = new TextBuffer("Lorem \nipsum \r\n");

  assertEquals(buf.eols.length, 2);
  assertEquals([...buf.eols], [{ start: 6, end: 7 }, { start: 13, end: 15 }]);
});

Deno.test("findEolIndex", () => {
  const buf = new TextBuffer("AA\r\nBB\nCC");

  assertEquals(buf.eols.length, 2);

  assertEquals(buf.indexToLine(0), 0);
  assertEquals(buf.indexToLine(1), 0);

  assertEquals(buf.indexToLine(2), 0);
  assertThrows(() => buf.indexToLine(3));

  assertEquals(buf.indexToLine(4), 1);
  assertEquals(buf.indexToLine(5, 0), 1);

  assertEquals(buf.indexToLine(6), 1);

  assertEquals(buf.indexToLine(7), 2);
  assertEquals(buf.indexToLine(8), 2);
});

Deno.test("findEolIndex_2", () => {
  const buf = new TextBuffer("1\n2\n3\n4\n5");
  //                      01 23 45 67 8
  //                       0  1  2  3

  assertEquals(buf.eols.length, 4);

  assertEquals(buf.indexToLine(0), 0);
  assertEquals(buf.indexToLine(1), 0);
  assertEquals(buf.indexToLine(2), 1);
  assertEquals(buf.indexToLine(3), 1);
  assertEquals(buf.indexToLine(4), 2);
  assertEquals(buf.indexToLine(5), 2);
  assertEquals(buf.indexToLine(6), 3);
  assertEquals(buf.indexToLine(7), 3);
  assertEquals(buf.indexToLine(8), 4);
  assertEquals(buf.indexToLine(8, 0), 4);
});

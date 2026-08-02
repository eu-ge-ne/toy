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

  assertEquals(buf.findEolIndex(0, 0), 0);
  assertEquals(buf.findEolIndex(1, 0), 0);

  assertEquals(buf.findEolIndex(2, 0), 0);
  assertThrows(() => buf.findEolIndex(3, 0));

  assertEquals(buf.findEolIndex(4, 0), 1);
  assertEquals(buf.findEolIndex(5, 0), 1);

  assertEquals(buf.findEolIndex(6, 0), 1);

  assertEquals(buf.findEolIndex(7, 0), 2);
  assertEquals(buf.findEolIndex(8, 0), 2);
});

Deno.test("findEolIndex_2", () => {
  const buf = new TextBuffer("1\n2\n3\n4\n5");
  //                      01 23 45 67 8
  //                       0  1  2  3

  assertEquals(buf.eols.length, 4);

  assertEquals(buf.findEolIndex(0, 0), 0);
  assertEquals(buf.findEolIndex(1, 0), 0);
  assertEquals(buf.findEolIndex(2, 0), 1);
  assertEquals(buf.findEolIndex(3, 0), 1);
  assertEquals(buf.findEolIndex(4, 0), 2);
  assertEquals(buf.findEolIndex(5, 0), 2);
  assertEquals(buf.findEolIndex(6, 0), 3);
  assertEquals(buf.findEolIndex(7, 0), 3);
  assertEquals(buf.findEolIndex(8, 0), 4);
  assertEquals(buf.findEolIndex(8, 0), 4);
});

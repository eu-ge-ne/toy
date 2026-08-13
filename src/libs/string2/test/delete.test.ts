import { assertEquals } from "@std/assert";

import { String2 } from "../string2.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

const EXPECTED =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function newStr(): String2 {
  const str = new String2();

  str.insert(str.charCount, "Lorem");
  str.insert(str.charCount, " ipsum");
  str.insert(str.charCount, " dolor");
  str.insert(str.charCount, " sit");
  str.insert(str.charCount, " amet,");
  str.insert(str.charCount, " consectetur");
  str.insert(str.charCount, " adipiscing");
  str.insert(str.charCount, " elit,");
  str.insert(str.charCount, " sed");
  str.insert(str.charCount, " do");
  str.insert(str.charCount, " eiusmod");
  str.insert(str.charCount, " tempor");
  str.insert(str.charCount, " incididunt");
  str.insert(str.charCount, " ut");
  str.insert(str.charCount, " labore");
  str.insert(str.charCount, " et");
  str.insert(str.charCount, " dolore");
  str.insert(str.charCount, " magna");
  str.insert(str.charCount, " aliqua.");

  return str;
}

function newStrReversed(): String2 {
  const str = new String2();

  str.insert(0, " aliqua.");
  str.insert(0, " magna");
  str.insert(0, " dolore");
  str.insert(0, " et");
  str.insert(0, " labore");
  str.insert(0, " ut");
  str.insert(0, " incididunt");
  str.insert(0, " tempor");
  str.insert(0, " eiusmod");
  str.insert(0, " do");
  str.insert(0, " sed");
  str.insert(0, " elit,");
  str.insert(0, " adipiscing");
  str.insert(0, " consectetur");
  str.insert(0, " amet,");
  str.insert(0, " sit");
  str.insert(0, " dolor");
  str.insert(0, " ipsum");
  str.insert(0, "Lorem");

  return str;
}

function testDeleteHead(str: String2, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assertGenerator(str.read(0), expected);
    assertEquals(str.charCount, expected.length);
    assertRoot(str.tree.root);

    str.delete(0, n);
    expected = expected.slice(n);
  }

  assertGenerator(str.read(0), "");
  assertEquals(str.charCount, 0);
  assertRoot(str.tree.root);
}

function testDeleteTail(str: String2, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assertGenerator(str.read(0), expected);
    assertEquals(str.charCount, expected.length);
    assertRoot(str.tree.root);

    str.delete(Math.max(str.charCount - n, 0), str.charCount);
    expected = expected.slice(0, -n);
  }

  assertGenerator(str.read(0), "");
  assertEquals(str.charCount, 0);
  assertRoot(str.tree.root);
}

function testDeleteMiddle(str: String2, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assertGenerator(str.read(0), expected);
    assertEquals(str.charCount, expected.length);
    assertRoot(str.tree.root);

    const pos = Math.floor(str.charCount / 2);
    str.delete(pos, pos + n);
    expected = expected.slice(0, pos) + expected.slice(pos + n);
  }

  assertGenerator(str.read(0), expected);
  assertEquals(str.charCount, 0);
  assertRoot(str.tree.root);
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the beginning of a text`, () => {
    testDeleteHead(newStr(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the beginning of a text reversed`, () => {
    testDeleteHead(newStrReversed(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the end of a text`, () => {
    testDeleteTail(newStr(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the end of a text reversed`, () => {
    testDeleteTail(newStrReversed(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the middle of a text`, () => {
    testDeleteMiddle(newStr(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the middle of text reversed`, () => {
    testDeleteMiddle(newStrReversed(), n);
  });
}

Deno.test("Delete splitting nodes", () => {
  const str = new String2(EXPECTED);

  let expected = EXPECTED;

  for (let n = 2; str.charCount > 0;) {
    const s = Math.floor(str.charCount / n);
    for (let i = n - 1; i >= 1; i -= 1) {
      assertGenerator(str.read(0), expected);
      assertEquals(str.charCount, expected.length);
      assertRoot(str.tree.root);

      str.delete(s * i, s * i + 2);
      expected = expected.slice(0, s * i) + expected.slice(s * i + 2);
    }
    n += 1;
  }

  assertGenerator(str.read(0), expected);
  assertEquals(str.charCount, 0);
  assertRoot(str.tree.root);
});

Deno.test("Delete count < 0", () => {
  const str = new String2("Lorem ipsum");

  str.delete(5, -6);

  assertGenerator(str.read(0), "Lorem ipsum");
  assertRoot(str.tree.root);
});

Deno.test("Delete removes lines", () => {
  const str = new String2();

  str.insert(0, "Lorem");
  str.insert(5, "ipsum");
  str.insert(5, "\n");
  str.insert(11, "\n");

  str.delete(0, 6);
  str.delete(5, 6);

  assertEquals(str.charCount, 5);
  assertEquals(str.lineCount, 1);
  assertGenerator(str.read(0), "ipsum");
  assertGenerator(str.read2(0, 0, 1, 0), "ipsum");
  assertRoot(str.tree.root);
});

Deno.test("Delete newline char removes line", () => {
  const str = new String2(" \n \n");

  assertEquals(str.lineCount, 3);

  str.delete(1, 2);

  assertGenerator(str.read(0), "  \n");
  assertEquals(str.lineCount, 2);
  assertRoot(str.tree.root);
});

Deno.test("Delete first newline char removes line", () => {
  const str = new String2("\n\n");

  assertEquals(str.lineCount, 3);

  str.delete(0, 1);

  assertGenerator(str.read(0), "\n");
  assertEquals(str.lineCount, 2);
  assertRoot(str.tree.root);
});

Deno.test("Delete line followed by newline", () => {
  const str = new String2(" \n \n\n \n");

  assertEquals(str.lineCount, 5);

  str.delete(2, 4);

  assertGenerator(str.read(0), " \n\n \n");
  assertEquals(str.lineCount, 4);
  assertRoot(str.tree.root);
});

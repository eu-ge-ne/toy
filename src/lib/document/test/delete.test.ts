import { assertEquals } from "@std/assert";

import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

const EXPECTED =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function newDoc(): Document {
  const doc = new Document();

  doc.insert(doc.charCount, "Lorem");
  doc.insert(doc.charCount, " ipsum");
  doc.insert(doc.charCount, " dolor");
  doc.insert(doc.charCount, " sit");
  doc.insert(doc.charCount, " amet,");
  doc.insert(doc.charCount, " consectetur");
  doc.insert(doc.charCount, " adipiscing");
  doc.insert(doc.charCount, " elit,");
  doc.insert(doc.charCount, " sed");
  doc.insert(doc.charCount, " do");
  doc.insert(doc.charCount, " eiusmod");
  doc.insert(doc.charCount, " tempor");
  doc.insert(doc.charCount, " incididunt");
  doc.insert(doc.charCount, " ut");
  doc.insert(doc.charCount, " labore");
  doc.insert(doc.charCount, " et");
  doc.insert(doc.charCount, " dolore");
  doc.insert(doc.charCount, " magna");
  doc.insert(doc.charCount, " aliqua.");

  return doc;
}

function newDocReversed(): Document {
  const doc = new Document();

  doc.insert(0, " aliqua.");
  doc.insert(0, " magna");
  doc.insert(0, " dolore");
  doc.insert(0, " et");
  doc.insert(0, " labore");
  doc.insert(0, " ut");
  doc.insert(0, " incididunt");
  doc.insert(0, " tempor");
  doc.insert(0, " eiusmod");
  doc.insert(0, " do");
  doc.insert(0, " sed");
  doc.insert(0, " elit,");
  doc.insert(0, " adipiscing");
  doc.insert(0, " consectetur");
  doc.insert(0, " amet,");
  doc.insert(0, " sit");
  doc.insert(0, " dolor");
  doc.insert(0, " ipsum");
  doc.insert(0, "Lorem");

  return doc;
}

function testDeleteHead(doc: Document, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assertGenerator(doc.read(0), expected);
    assertEquals(doc.charCount, expected.length);
    assertRoot(doc.tree.root);

    doc.delete(0, n);
    expected = expected.slice(n);
  }

  assertGenerator(doc.read(0), "");
  assertEquals(doc.charCount, 0);
  assertRoot(doc.tree.root);
}

function testDeleteTail(doc: Document, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assertGenerator(doc.read(0), expected);
    assertEquals(doc.charCount, expected.length);
    assertRoot(doc.tree.root);

    doc.delete(Math.max(doc.charCount - n, 0), doc.charCount);
    expected = expected.slice(0, -n);
  }

  assertGenerator(doc.read(0), "");
  assertEquals(doc.charCount, 0);
  assertRoot(doc.tree.root);
}

function testDeleteMiddle(doc: Document, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assertGenerator(doc.read(0), expected);
    assertEquals(doc.charCount, expected.length);
    assertRoot(doc.tree.root);

    const pos = Math.floor(doc.charCount / 2);
    doc.delete(pos, pos + n);
    expected = expected.slice(0, pos) + expected.slice(pos + n);
  }

  assertGenerator(doc.read(0), expected);
  assertEquals(doc.charCount, 0);
  assertRoot(doc.tree.root);
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the beginning of a text`, () => {
    testDeleteHead(newDoc(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the beginning of a text reversed`, () => {
    testDeleteHead(newDocReversed(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the end of a text`, () => {
    testDeleteTail(newDoc(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the end of a text reversed`, () => {
    testDeleteTail(newDocReversed(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the middle of a text`, () => {
    testDeleteMiddle(newDoc(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the middle of text reversed`, () => {
    testDeleteMiddle(newDocReversed(), n);
  });
}

Deno.test("Delete splitting nodes", () => {
  const doc = new Document(EXPECTED);

  let expected = EXPECTED;

  for (let n = 2; doc.charCount > 0;) {
    const s = Math.floor(doc.charCount / n);
    for (let i = n - 1; i >= 1; i -= 1) {
      assertGenerator(doc.read(0), expected);
      assertEquals(doc.charCount, expected.length);
      assertRoot(doc.tree.root);

      doc.delete(s * i, s * i + 2);
      expected = expected.slice(0, s * i) + expected.slice(s * i + 2);
    }
    n += 1;
  }

  assertGenerator(doc.read(0), expected);
  assertEquals(doc.charCount, 0);
  assertRoot(doc.tree.root);
});

Deno.test("Delete count < 0", () => {
  const doc = new Document("Lorem ipsum");

  doc.delete(5, -6);

  assertGenerator(doc.read(0), "Lorem ipsum");
  assertRoot(doc.tree.root);
});

Deno.test("Delete removes lines", () => {
  const doc = new Document();

  doc.insert(0, "Lorem");
  doc.insert(5, "ipsum");
  doc.insert(5, "\n");
  doc.insert(11, "\n");

  doc.delete(0, 6);
  doc.delete(5, 6);

  assertEquals(doc.charCount, 5);
  assertEquals(doc.lineCount, 1);
  assertGenerator(doc.read(0), "ipsum");
  assertGenerator(doc.read2([0, 0], [1, 0]), "ipsum");
  assertRoot(doc.tree.root);
});

Deno.test("Delete newline char removes line", () => {
  const doc = new Document(" \n \n");

  assertEquals(doc.lineCount, 3);

  doc.delete(1, 2);

  assertGenerator(doc.read(0), "  \n");
  assertEquals(doc.lineCount, 2);
  assertRoot(doc.tree.root);
});

Deno.test("Delete first newline char removes line", () => {
  const doc = new Document("\n\n");

  assertEquals(doc.lineCount, 3);

  doc.delete(0, 1);

  assertGenerator(doc.read(0), "\n");
  assertEquals(doc.lineCount, 2);
  assertRoot(doc.tree.root);
});

Deno.test("Delete line followed by newline", () => {
  const doc = new Document(" \n \n\n \n");

  assertEquals(doc.lineCount, 5);

  doc.delete(2, 4);

  assertGenerator(doc.read(0), " \n\n \n");
  assertEquals(doc.lineCount, 4);
  assertRoot(doc.tree.root);
});

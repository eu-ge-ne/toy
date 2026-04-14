import { assertEquals } from "@std/assert";

import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Empty", () => {
  const doc = new Document();

  assertEquals(doc.lineCount, 0);
  assertGenerator(doc.read2([0, 0], [1, 0]), "");

  assertRoot(doc.tree.root);
});

Deno.test("1 line", () => {
  const doc = new Document("0");

  assertEquals(doc.lineCount, 1);
  assertGenerator(doc.read2([0, 0], [1, 0]), "0");

  assertRoot(doc.tree.root);
});

Deno.test("2 lines", () => {
  const doc = new Document("0\n");

  assertEquals(doc.lineCount, 2);
  assertGenerator(doc.read2([0, 0], [1, 0]), "0\n");
  assertGenerator(doc.read2([1, 0], [2, 0]), "");

  assertRoot(doc.tree.root);
});

Deno.test("3 lines", () => {
  const doc = new Document("0\n1\n");

  assertEquals(doc.lineCount, 3);
  assertGenerator(doc.read2([0, 0], [1, 0]), "0\n");
  assertGenerator(doc.read2([1, 0], [2, 0]), "1\n");
  assertGenerator(doc.read2([2, 0], [3, 0]), "");

  assertRoot(doc.tree.root);
});

Deno.test("Line at valid index", () => {
  const doc = new Document();

  doc.insert(0, "Lorem\naliqua.");
  doc.insert(6, "ipsum\nmagna\n");
  doc.insert(12, "dolor\ndolore\n");
  doc.insert(18, "sit\net\n");
  doc.insert(22, "amet,\nlabore\n");
  doc.insert(28, "consectetur\nut\n");
  doc.insert(40, "adipiscing\nincididunt\n");
  doc.insert(51, "elit,\ntempor\n");
  doc.insert(57, "sed\neiusmod\n");
  doc.insert(61, "do\n");

  assertGenerator(doc.read2([0, 0], [1, 0]), "Lorem\n");
  assertGenerator(doc.read2([1, 0], [2, 0]), "ipsum\n");
  assertGenerator(doc.read2([2, 0], [3, 0]), "dolor\n");
  assertGenerator(doc.read2([3, 0], [4, 0]), "sit\n");
  assertGenerator(doc.read2([4, 0], [5, 0]), "amet,\n");
  assertGenerator(doc.read2([5, 0], [6, 0]), "consectetur\n");
  assertGenerator(doc.read2([6, 0], [7, 0]), "adipiscing\n");
  assertGenerator(doc.read2([7, 0], [8, 0]), "elit,\n");
  assertGenerator(doc.read2([8, 0], [9, 0]), "sed\n");
  assertGenerator(doc.read2([9, 0], [10, 0]), "do\n");
  assertGenerator(doc.read2([10, 0], [11, 0]), "eiusmod\n");
  assertGenerator(doc.read2([11, 0], [12, 0]), "tempor\n");
  assertGenerator(doc.read2([12, 0], [13, 0]), "incididunt\n");
  assertGenerator(doc.read2([13, 0], [14, 0]), "ut\n");
  assertGenerator(doc.read2([14, 0], [15, 0]), "labore\n");
  assertGenerator(doc.read2([15, 0], [16, 0]), "et\n");
  assertGenerator(doc.read2([16, 0], [17, 0]), "dolore\n");
  assertGenerator(doc.read2([17, 0], [18, 0]), "magna\n");
  assertGenerator(doc.read2([18, 0], [19, 0]), "aliqua.");

  assertRoot(doc.tree.root);
});

Deno.test("Line at index >= line_count", () => {
  const doc = new Document("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(doc.read2([4, 0], [5, 0]), "amet");
  assertGenerator(doc.read2([5, 0], [6, 0]), "");
  assertGenerator(doc.read2([6, 0], [7, 0]), "");

  assertRoot(doc.tree.root);
});

Deno.test("Line at index < 0", () => {
  const doc = new Document("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(doc.read2([0, 0], [1, 0]), "Lorem\n");
  assertGenerator(
    doc.read2([doc.lineCount - 1, 0], [doc.lineCount, 0]),
    "amet",
  );
  assertGenerator(
    doc.read2([doc.lineCount - 2, 0], [doc.lineCount - 1, 0]),
    "sit\n",
  );

  assertRoot(doc.tree.root);
});

Deno.test("Insert adds lines", () => {
  const doc = new Document();

  for (let i = 0; i < 10; i += 1) {
    doc.insert(doc.charCount, `${i}\n`);

    assertEquals(doc.lineCount, i + 2);
    assertGenerator(doc.read2([i, 0], [i + 1, 0]), `${i}\n`);
    assertRoot(doc.tree.root);
  }

  assertEquals(doc.lineCount, 11);
  assertGenerator(doc.read2([11, 0], [12, 0]), "");
  assertRoot(doc.tree.root);
});

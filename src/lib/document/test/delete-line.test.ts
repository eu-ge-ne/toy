import { assertEquals } from "@std/assert";

import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Delete line", () => {
  const doc = new Document("Lorem \nipsum \ndolor \nsit \namet ");

  assertEquals(doc.lineCount, 5);

  doc.delete2([4, 0], [5, 0]);

  assertGenerator(doc.read(0), "Lorem \nipsum \ndolor \nsit \n");
  assertEquals(doc.charCount, 26);
  assertEquals(doc.lineCount, 5);
  assertRoot(doc.tree.root);

  doc.delete2([3, 0], [4, 0]);

  assertGenerator(doc.read(0), "Lorem \nipsum \ndolor \n");
  assertEquals(doc.charCount, 21);
  assertEquals(doc.lineCount, 4);
  assertRoot(doc.tree.root);

  doc.delete2([2, 0], [3, 0]);

  assertGenerator(doc.read(0), "Lorem \nipsum \n");
  assertEquals(doc.charCount, 14);
  assertEquals(doc.lineCount, 3);
  assertRoot(doc.tree.root);

  doc.delete2([1, 0], [2, 0]);

  assertGenerator(doc.read(0), "Lorem \n");
  assertEquals(doc.charCount, 7);
  assertEquals(doc.lineCount, 2);
  assertRoot(doc.tree.root);
});

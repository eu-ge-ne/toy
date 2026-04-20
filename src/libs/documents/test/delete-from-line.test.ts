import { assertEquals } from "@std/assert";

import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Delete from line", () => {
  const doc = new Document("Lorem \nipsum \ndolor \nsit \namet");

  assertEquals(doc.lineCount, 5);

  doc.delete2([3, 0]);

  assertGenerator(doc.read(0), "Lorem \nipsum \ndolor \n");
  assertEquals(doc.charCount, 21);
  assertEquals(doc.lineCount, 4);
  assertRoot(doc.tree.root);

  doc.delete2([1, 0]);

  assertGenerator(doc.read(0), "Lorem \n");
  assertEquals(doc.charCount, 7);
  assertEquals(doc.lineCount, 2);
  assertRoot(doc.tree.root);
});

import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Line at valid index", () => {
  const doc = new Document("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(doc.read2([0, 0]), "Lorem\nipsum\ndolor\nsit\namet");
  assertGenerator(doc.read2([1, 0]), "ipsum\ndolor\nsit\namet");
  assertGenerator(doc.read2([2, 0]), "dolor\nsit\namet");
  assertGenerator(doc.read2([3, 0]), "sit\namet");
  assertGenerator(doc.read2([4, 0]), "amet");

  assertRoot(doc.tree.root);
});

Deno.test("Line at index >= line_count", () => {
  const doc = new Document("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(doc.read2([4, 0]), "amet");
  assertGenerator(doc.read2([5, 0]), "");
  assertGenerator(doc.read2([6, 0]), "");

  assertRoot(doc.tree.root);
});

Deno.test("Line at index < 0", () => {
  const doc = new Document("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(doc.read2([0, 0]), "Lorem\nipsum\ndolor\nsit\namet");
  assertGenerator(doc.read2([doc.lineCount - 1, 0]), "amet");
  assertGenerator(doc.read2([doc.lineCount - 2, 0]), "sit\namet");

  assertRoot(doc.tree.root);
});

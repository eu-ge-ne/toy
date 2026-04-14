import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Read empty", () => {
  const doc = new Document();

  assertGenerator(doc.read(0), "");
  assertRoot(doc.tree.root);
});

Deno.test("Read", () => {
  const doc = new Document("Lorem ipsum dolor");

  assertGenerator(doc.read(6, 12), "ipsum ");
  assertRoot(doc.tree.root);
});

Deno.test("Read at start >= count", () => {
  const doc = new Document("Lorem");

  assertGenerator(doc.read(4), "m");
  assertGenerator(doc.read(5), "");
  assertGenerator(doc.read(6), "");

  assertRoot(doc.tree.root);
});

Deno.test("Read at start < 0", () => {
  const doc = new Document("Lorem");

  assertGenerator(doc.read(0), "Lorem");
  assertGenerator(doc.read(doc.charCount - 1), "m");
  assertGenerator(doc.read(doc.charCount - 2), "em");

  assertRoot(doc.tree.root);
});

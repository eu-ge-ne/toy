import { assertEquals } from "@std/assert";

import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Undo insert", () => {
  const doc = new Document();

  doc.insert(doc.charCount, "Lorem");
  assertGenerator(doc.read(0), "Lorem");
  assertEquals(doc.charCount, 5);
  assertRoot(doc.tree.root);

  const a = structuredClone(doc.tree.root);
  doc.insert(doc.charCount, "Lorem");
  doc.tree.root = a;

  assertGenerator(doc.read(0), "Lorem");
  assertEquals(doc.charCount, 5);
  assertRoot(doc.tree.root);
});

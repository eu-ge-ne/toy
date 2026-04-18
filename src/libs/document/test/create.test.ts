import { assertEquals } from "@std/assert";

import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Create empty", () => {
  const doc = new Document();

  assertGenerator(doc.read(0), "");
  assertEquals(doc.charCount, 0);
  assertEquals(doc.lineCount, 0);

  assertRoot(doc.tree.root);
});

Deno.test("Create", () => {
  const doc = new Document("Lorem ipsum");

  assertGenerator(doc.read(0), "Lorem ipsum");
  assertEquals(doc.charCount, 11);
  assertEquals(doc.lineCount, 1);

  assertRoot(doc.tree.root);
});

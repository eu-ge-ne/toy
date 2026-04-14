import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Insert into 0 line", () => {
  const doc = new Document();

  doc.insert2([0, 0], "Lorem ipsum");

  assertGenerator(doc.read(0), "Lorem ipsum");
  assertGenerator(doc.read2([0, 0], [1, 0]), "Lorem ipsum");

  assertRoot(doc.tree.root);
});

Deno.test("Insert into a line", () => {
  const doc = new Document();
  doc.insert(0, "Lorem");

  doc.insert2([0, 5], " ipsum");

  assertGenerator(doc.read(0), "Lorem ipsum");
  assertGenerator(doc.read2([0, 0], [1, 0]), "Lorem ipsum");

  assertRoot(doc.tree.root);
});

Deno.test("Insert into a line which does not exist", () => {
  const doc = new Document();

  doc.insert2([1, 0], "Lorem ipsum");

  assertGenerator(doc.read(0), "");
  assertGenerator(doc.read2([0, 0], [1, 0]), "");

  assertRoot(doc.tree.root);
});

Deno.test("Insert into a column which does not exist", () => {
  const doc = new Document();

  doc.insert2([0, 1], "Lorem ipsum");

  assertGenerator(doc.read(0), "");
  assertGenerator(doc.read2([0, 0], [1, 0]), "");

  assertRoot(doc.tree.root);
});

import { String2 } from "../string2.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Insert into 0 line", () => {
  const str = new String2();

  str.insert2(0, 0, "Lorem ipsum");

  assertGenerator(str.read(0), "Lorem ipsum");
  assertGenerator(str.read2(0, 0, 1, 0), "Lorem ipsum");

  assertRoot(str.tree.root);
});

Deno.test("Insert into a line", () => {
  const str = new String2();
  str.insert(0, "Lorem");

  str.insert2(0, 5, " ipsum");

  assertGenerator(str.read(0), "Lorem ipsum");
  assertGenerator(str.read2(0, 0, 1, 0), "Lorem ipsum");

  assertRoot(str.tree.root);
});

Deno.test("Insert into a line which does not exist", () => {
  const str = new String2();

  str.insert2(1, 0, "Lorem ipsum");

  assertGenerator(str.read(0), "");
  assertGenerator(str.read2(0, 0, 1, 0), "");

  assertRoot(str.tree.root);
});

Deno.test("Insert into a column which does not exist", () => {
  const str = new String2();

  str.insert2(0, 1, "Lorem ipsum");

  assertGenerator(str.read(0), "");
  assertGenerator(str.read2(0, 0, 1, 0), "");

  assertRoot(str.tree.root);
});

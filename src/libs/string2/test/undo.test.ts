import { assertEquals } from "@std/assert";

import { String2 } from "../string2.ts";
import { assertGenerator, assertRoot } from "./helpers.ts";

Deno.test("Undo insert", () => {
  const str = new String2();

  str.insert(str.charCount, "Lorem");
  assertGenerator(str.read(0), "Lorem");
  assertEquals(str.charCount, 5);
  assertRoot(str.tree.root);

  const a = str.tree.root.clone();
  str.insert(str.charCount, "Lorem");
  str.tree.root = a;

  assertGenerator(str.read(0), "Lorem");
  assertEquals(str.charCount, 5);
  assertRoot(str.tree.root);
});

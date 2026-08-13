import { assertEquals } from "@std/assert";

import { String2 } from "../string2.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Create empty", () => {
  const str = new String2();

  assertGenerator(str.read(0), "");
  assertEquals(str.charCount, 0);
  assertEquals(str.lineCount, 0);

  assertRoot(str.tree.root);
});

Deno.test("Create", () => {
  const str = new String2("Lorem ipsum");

  assertGenerator(str.read(0), "Lorem ipsum");
  assertEquals(str.charCount, 11);
  assertEquals(str.lineCount, 1);

  assertRoot(str.tree.root);
});

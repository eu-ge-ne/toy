import { assertEquals } from "@std/assert";

import { String2 } from "../string2.ts";
import { assertGenerator, assertRoot } from "./helpers.ts";

Deno.test("Delete from line", () => {
  const str = new String2("Lorem \nipsum \ndolor \nsit \namet");

  assertEquals(str.lineCount, 5);

  str.delete2(3, 0);

  assertGenerator(str.read(0), "Lorem \nipsum \ndolor \n");
  assertEquals(str.charCount, 21);
  assertEquals(str.lineCount, 4);
  assertRoot(str.tree.root);

  str.delete2(1, 0);

  assertGenerator(str.read(0), "Lorem \n");
  assertEquals(str.charCount, 7);
  assertEquals(str.lineCount, 2);
  assertRoot(str.tree.root);
});

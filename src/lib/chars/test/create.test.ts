import { assertEquals } from "@std/assert";

import { Buf } from "../buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

Deno.test("Create empty", () => {
  const buf = new Buf();

  assert_generator(buf.read(0), "");
  assertEquals(buf.charCount, 0);
  assertEquals(buf.lineCount, 0);

  assert_root(buf.tree.root);
});

Deno.test("Create", () => {
  const buf = new Buf("Lorem ipsum");

  assert_generator(buf.read(0), "Lorem ipsum");
  assertEquals(buf.charCount, 11);
  assertEquals(buf.lineCount, 1);

  assert_root(buf.tree.root);
});

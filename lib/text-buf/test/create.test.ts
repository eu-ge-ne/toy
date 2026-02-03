import { assertEquals } from "@std/assert";

import { TextBuf } from "../text-buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

Deno.test("Create empty", () => {
  const buf = new TextBuf();

  assert_generator(buf.read(0), "");
  assertEquals(buf.count, 0);
  assertEquals(buf.line_count, 0);

  assert_root(buf.tree.root);
});

Deno.test("Create", () => {
  const buf = new TextBuf("Lorem ipsum");

  assert_generator(buf.read(0), "Lorem ipsum");
  assertEquals(buf.count, 11);
  assertEquals(buf.line_count, 1);

  assert_root(buf.tree.root);
});

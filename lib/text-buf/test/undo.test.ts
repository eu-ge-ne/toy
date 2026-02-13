import { assertEquals } from "@std/assert";

import { TextBuf } from "../text-buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

Deno.test("Undo insert", () => {
  const buf = new TextBuf();

  buf.insert(buf.charCount, "Lorem");
  assert_generator(buf.read(0), "Lorem");
  assertEquals(buf.charCount, 5);
  assert_root(buf.tree.root);

  const a = structuredClone(buf.tree.root);
  buf.insert(buf.charCount, "Lorem");
  buf.tree.root = a;

  assert_generator(buf.read(0), "Lorem");
  assertEquals(buf.charCount, 5);
  assert_root(buf.tree.root);
});

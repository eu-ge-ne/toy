import { assertEquals } from "@std/assert";

import { TextBuf } from "../text-buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

Deno.test("Delete line", () => {
  const buf = new TextBuf("Lorem \nipsum \ndolor \nsit \namet ");

  assertEquals(buf.lineCount, 5);

  buf.delete2([4, 0], [5, 0]);

  assert_generator(buf.read(0), "Lorem \nipsum \ndolor \nsit \n");
  assertEquals(buf.charCount, 26);
  assertEquals(buf.lineCount, 5);
  assert_root(buf.tree.root);

  buf.delete2([3, 0], [4, 0]);

  assert_generator(buf.read(0), "Lorem \nipsum \ndolor \n");
  assertEquals(buf.charCount, 21);
  assertEquals(buf.lineCount, 4);
  assert_root(buf.tree.root);

  buf.delete2([2, 0], [3, 0]);

  assert_generator(buf.read(0), "Lorem \nipsum \n");
  assertEquals(buf.charCount, 14);
  assertEquals(buf.lineCount, 3);
  assert_root(buf.tree.root);

  buf.delete2([1, 0], [2, 0]);

  assert_generator(buf.read(0), "Lorem \n");
  assertEquals(buf.charCount, 7);
  assertEquals(buf.lineCount, 2);
  assert_root(buf.tree.root);
});

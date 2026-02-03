import { TextBuf } from "../text-buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

Deno.test("Line at valid index", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assert_generator(buf.read2([0, 0]), "Lorem\nipsum\ndolor\nsit\namet");
  assert_generator(buf.read2([1, 0]), "ipsum\ndolor\nsit\namet");
  assert_generator(buf.read2([2, 0]), "dolor\nsit\namet");
  assert_generator(buf.read2([3, 0]), "sit\namet");
  assert_generator(buf.read2([4, 0]), "amet");

  assert_root(buf.tree.root);
});

Deno.test("Line at index >= line_count", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assert_generator(buf.read2([4, 0]), "amet");
  assert_generator(buf.read2([5, 0]), "");
  assert_generator(buf.read2([6, 0]), "");

  assert_root(buf.tree.root);
});

Deno.test("Line at index < 0", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assert_generator(buf.read2([0, 0]), "Lorem\nipsum\ndolor\nsit\namet");
  assert_generator(buf.read2([buf.line_count - 1, 0]), "amet");
  assert_generator(buf.read2([buf.line_count - 2, 0]), "sit\namet");

  assert_root(buf.tree.root);
});

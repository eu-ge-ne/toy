import { assertEquals } from "@std/assert";

import { TextBuf } from "../text-buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

Deno.test("Empty", () => {
  const buf = new TextBuf();

  assertEquals(buf.line_count, 0);
  assert_generator(buf.read2([0, 0], [1, 0]), "");

  assert_root(buf.tree.root);
});

Deno.test("1 line", () => {
  const buf = new TextBuf("0");

  assertEquals(buf.line_count, 1);
  assert_generator(buf.read2([0, 0], [1, 0]), "0");

  assert_root(buf.tree.root);
});

Deno.test("2 lines", () => {
  const buf = new TextBuf("0\n");

  assertEquals(buf.line_count, 2);
  assert_generator(buf.read2([0, 0], [1, 0]), "0\n");
  assert_generator(buf.read2([1, 0], [2, 0]), "");

  assert_root(buf.tree.root);
});

Deno.test("3 lines", () => {
  const buf = new TextBuf("0\n1\n");

  assertEquals(buf.line_count, 3);
  assert_generator(buf.read2([0, 0], [1, 0]), "0\n");
  assert_generator(buf.read2([1, 0], [2, 0]), "1\n");
  assert_generator(buf.read2([2, 0], [3, 0]), "");

  assert_root(buf.tree.root);
});

Deno.test("Line at valid index", () => {
  const buf = new TextBuf();

  buf.insert(0, "Lorem\naliqua.");
  buf.insert(6, "ipsum\nmagna\n");
  buf.insert(12, "dolor\ndolore\n");
  buf.insert(18, "sit\net\n");
  buf.insert(22, "amet,\nlabore\n");
  buf.insert(28, "consectetur\nut\n");
  buf.insert(40, "adipiscing\nincididunt\n");
  buf.insert(51, "elit,\ntempor\n");
  buf.insert(57, "sed\neiusmod\n");
  buf.insert(61, "do\n");

  assert_generator(buf.read2([0, 0], [1, 0]), "Lorem\n");
  assert_generator(buf.read2([1, 0], [2, 0]), "ipsum\n");
  assert_generator(buf.read2([2, 0], [3, 0]), "dolor\n");
  assert_generator(buf.read2([3, 0], [4, 0]), "sit\n");
  assert_generator(buf.read2([4, 0], [5, 0]), "amet,\n");
  assert_generator(buf.read2([5, 0], [6, 0]), "consectetur\n");
  assert_generator(buf.read2([6, 0], [7, 0]), "adipiscing\n");
  assert_generator(buf.read2([7, 0], [8, 0]), "elit,\n");
  assert_generator(buf.read2([8, 0], [9, 0]), "sed\n");
  assert_generator(buf.read2([9, 0], [10, 0]), "do\n");
  assert_generator(buf.read2([10, 0], [11, 0]), "eiusmod\n");
  assert_generator(buf.read2([11, 0], [12, 0]), "tempor\n");
  assert_generator(buf.read2([12, 0], [13, 0]), "incididunt\n");
  assert_generator(buf.read2([13, 0], [14, 0]), "ut\n");
  assert_generator(buf.read2([14, 0], [15, 0]), "labore\n");
  assert_generator(buf.read2([15, 0], [16, 0]), "et\n");
  assert_generator(buf.read2([16, 0], [17, 0]), "dolore\n");
  assert_generator(buf.read2([17, 0], [18, 0]), "magna\n");
  assert_generator(buf.read2([18, 0], [19, 0]), "aliqua.");

  assert_root(buf.tree.root);
});

Deno.test("Line at index >= line_count", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assert_generator(buf.read2([4, 0], [5, 0]), "amet");
  assert_generator(buf.read2([5, 0], [6, 0]), "");
  assert_generator(buf.read2([6, 0], [7, 0]), "");

  assert_root(buf.tree.root);
});

Deno.test("Line at index < 0", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assert_generator(buf.read2([0, 0], [1, 0]), "Lorem\n");
  assert_generator(
    buf.read2([buf.line_count - 1, 0], [buf.line_count, 0]),
    "amet",
  );
  assert_generator(
    buf.read2([buf.line_count - 2, 0], [buf.line_count - 1, 0]),
    "sit\n",
  );

  assert_root(buf.tree.root);
});

Deno.test("Insert adds lines", () => {
  const buf = new TextBuf();

  for (let i = 0; i < 10; i += 1) {
    buf.insert(buf.count, `${i}\n`);

    assertEquals(buf.line_count, i + 2);
    assert_generator(buf.read2([i, 0], [i + 1, 0]), `${i}\n`);
    assert_root(buf.tree.root);
  }

  assertEquals(buf.line_count, 11);
  assert_generator(buf.read2([11, 0], [12, 0]), "");
  assert_root(buf.tree.root);
});

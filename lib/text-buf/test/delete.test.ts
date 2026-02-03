import { assertEquals } from "@std/assert";

import { TextBuf } from "../text-buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

const EXPECTED =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function text_buf(): TextBuf {
  const buf = new TextBuf();

  buf.insert(buf.count, "Lorem");
  buf.insert(buf.count, " ipsum");
  buf.insert(buf.count, " dolor");
  buf.insert(buf.count, " sit");
  buf.insert(buf.count, " amet,");
  buf.insert(buf.count, " consectetur");
  buf.insert(buf.count, " adipiscing");
  buf.insert(buf.count, " elit,");
  buf.insert(buf.count, " sed");
  buf.insert(buf.count, " do");
  buf.insert(buf.count, " eiusmod");
  buf.insert(buf.count, " tempor");
  buf.insert(buf.count, " incididunt");
  buf.insert(buf.count, " ut");
  buf.insert(buf.count, " labore");
  buf.insert(buf.count, " et");
  buf.insert(buf.count, " dolore");
  buf.insert(buf.count, " magna");
  buf.insert(buf.count, " aliqua.");

  return buf;
}

function text_buf_reversed(): TextBuf {
  const buf = new TextBuf();

  buf.insert(0, " aliqua.");
  buf.insert(0, " magna");
  buf.insert(0, " dolore");
  buf.insert(0, " et");
  buf.insert(0, " labore");
  buf.insert(0, " ut");
  buf.insert(0, " incididunt");
  buf.insert(0, " tempor");
  buf.insert(0, " eiusmod");
  buf.insert(0, " do");
  buf.insert(0, " sed");
  buf.insert(0, " elit,");
  buf.insert(0, " adipiscing");
  buf.insert(0, " consectetur");
  buf.insert(0, " amet,");
  buf.insert(0, " sit");
  buf.insert(0, " dolor");
  buf.insert(0, " ipsum");
  buf.insert(0, "Lorem");

  return buf;
}

function test_delete_head(buf: TextBuf, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assert_generator(buf.read(0), expected);
    assertEquals(buf.count, expected.length);
    assert_root(buf.tree.root);

    buf.delete(0, n);
    expected = expected.slice(n);
  }

  assert_generator(buf.read(0), "");
  assertEquals(buf.count, 0);
  assert_root(buf.tree.root);
}

function test_delete_tail(buf: TextBuf, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assert_generator(buf.read(0), expected);
    assertEquals(buf.count, expected.length);
    assert_root(buf.tree.root);

    buf.delete(Math.max(buf.count - n, 0), buf.count);
    expected = expected.slice(0, -n);
  }

  assert_generator(buf.read(0), "");
  assertEquals(buf.count, 0);
  assert_root(buf.tree.root);
}

function test_delete_middle(buf: TextBuf, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assert_generator(buf.read(0), expected);
    assertEquals(buf.count, expected.length);
    assert_root(buf.tree.root);

    const pos = Math.floor(buf.count / 2);
    buf.delete(pos, pos + n);
    expected = expected.slice(0, pos) + expected.slice(pos + n);
  }

  assert_generator(buf.read(0), expected);
  assertEquals(buf.count, 0);
  assert_root(buf.tree.root);
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the beginning of a text`, () => {
    test_delete_head(text_buf(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the beginning of a text reversed`, () => {
    test_delete_head(text_buf_reversed(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the end of a text`, () => {
    test_delete_tail(text_buf(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the end of a text reversed`, () => {
    test_delete_tail(text_buf_reversed(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the middle of a text`, () => {
    test_delete_middle(text_buf(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the middle of text reversed`, () => {
    test_delete_middle(text_buf_reversed(), n);
  });
}

Deno.test("Delete splitting nodes", () => {
  const buf = new TextBuf(EXPECTED);

  let expected = EXPECTED;

  for (let n = 2; buf.count > 0;) {
    const s = Math.floor(buf.count / n);
    for (let i = n - 1; i >= 1; i -= 1) {
      assert_generator(buf.read(0), expected);
      assertEquals(buf.count, expected.length);
      assert_root(buf.tree.root);

      buf.delete(s * i, s * i + 2);
      expected = expected.slice(0, s * i) + expected.slice(s * i + 2);
    }
    n += 1;
  }

  assert_generator(buf.read(0), expected);
  assertEquals(buf.count, 0);
  assert_root(buf.tree.root);
});

Deno.test("Delete count < 0", () => {
  const buf = new TextBuf("Lorem ipsum");

  buf.delete(5, -6);

  assert_generator(buf.read(0), "Lorem ipsum");
  assert_root(buf.tree.root);
});

Deno.test("Delete removes lines", () => {
  const buf = new TextBuf();

  buf.insert(0, "Lorem");
  buf.insert(5, "ipsum");
  buf.insert(5, "\n");
  buf.insert(11, "\n");

  buf.delete(0, 6);
  buf.delete(5, 6);

  assertEquals(buf.count, 5);
  assertEquals(buf.line_count, 1);
  assert_generator(buf.read(0), "ipsum");
  assert_generator(buf.read2([0, 0], [1, 0]), "ipsum");
  assert_root(buf.tree.root);
});

Deno.test("Delete newline char removes line", () => {
  const buf = new TextBuf(" \n \n");

  assertEquals(buf.line_count, 3);

  buf.delete(1, 2);

  assert_generator(buf.read(0), "  \n");
  assertEquals(buf.line_count, 2);
  assert_root(buf.tree.root);
});

Deno.test("Delete first newline char removes line", () => {
  const buf = new TextBuf("\n\n");

  assertEquals(buf.line_count, 3);

  buf.delete(0, 1);

  assert_generator(buf.read(0), "\n");
  assertEquals(buf.line_count, 2);
  assert_root(buf.tree.root);
});

Deno.test("Delete line followed by newline", () => {
  const buf = new TextBuf(" \n \n\n \n");

  assertEquals(buf.line_count, 5);

  buf.delete(2, 4);

  assert_generator(buf.read(0), " \n\n \n");
  assertEquals(buf.line_count, 4);
  assert_root(buf.tree.root);
});

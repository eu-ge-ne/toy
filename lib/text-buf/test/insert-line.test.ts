import { TextBuf } from "../text-buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

Deno.test("Insert into 0 line", () => {
  const buf = new TextBuf();

  buf.insert2([0, 0], "Lorem ipsum");

  assert_generator(buf.read(0), "Lorem ipsum");
  assert_generator(buf.read2([0, 0], [1, 0]), "Lorem ipsum");

  assert_root(buf.tree.root);
});

Deno.test("Insert into a line", () => {
  const buf = new TextBuf();
  buf.insert(0, "Lorem");

  buf.insert2([0, 5], " ipsum");

  assert_generator(buf.read(0), "Lorem ipsum");
  assert_generator(buf.read2([0, 0], [1, 0]), "Lorem ipsum");

  assert_root(buf.tree.root);
});

Deno.test("Insert into a line which does not exist", () => {
  const buf = new TextBuf();

  buf.insert2([1, 0], "Lorem ipsum");

  assert_generator(buf.read(0), "");
  assert_generator(buf.read2([0, 0], [1, 0]), "");

  assert_root(buf.tree.root);
});

Deno.test("Insert into a column which does not exist", () => {
  const buf = new TextBuf();

  buf.insert2([0, 1], "Lorem ipsum");

  assert_generator(buf.read(0), "");
  assert_generator(buf.read2([0, 0], [1, 0]), "");

  assert_root(buf.tree.root);
});

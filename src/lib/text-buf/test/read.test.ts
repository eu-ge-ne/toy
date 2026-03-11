import { TextBuf } from "../text-buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

Deno.test("Read empty", () => {
  const buf = new TextBuf();

  assert_generator(buf.read(0), "");
  assert_root(buf.tree.root);
});

Deno.test("Read", () => {
  const buf = new TextBuf("Lorem ipsum dolor");

  assert_generator(buf.read(6, 12), "ipsum ");
  assert_root(buf.tree.root);
});

Deno.test("Read at start >= count", () => {
  const buf = new TextBuf("Lorem");

  assert_generator(buf.read(4), "m");
  assert_generator(buf.read(5), "");
  assert_generator(buf.read(6), "");

  assert_root(buf.tree.root);
});

Deno.test("Read at start < 0", () => {
  const buf = new TextBuf("Lorem");

  assert_generator(buf.read(0), "Lorem");
  assert_generator(buf.read(buf.charCount - 1), "m");
  assert_generator(buf.read(buf.charCount - 2), "em");

  assert_root(buf.tree.root);
});

import { String2 } from "../string2.ts";
import { assertGenerator, assertRoot } from "./helpers.ts";

Deno.test("Read empty", () => {
  const str = new String2();

  assertGenerator(str.read(0), "");
  assertRoot(str.tree.root);
});

Deno.test("Read", () => {
  const str = new String2("Lorem ipsum dolor");

  assertGenerator(str.read(6, 12), "ipsum ");
  assertRoot(str.tree.root);
});

Deno.test("Read at start >= count", () => {
  const str = new String2("Lorem");

  assertGenerator(str.read(4), "m");
  assertGenerator(str.read(5), "");
  assertGenerator(str.read(6), "");

  assertRoot(str.tree.root);
});

Deno.test("Read at start < 0", () => {
  const str = new String2("Lorem");

  assertGenerator(str.read(0), "Lorem");
  assertGenerator(str.read(str.charCount - 1), "m");
  assertGenerator(str.read(str.charCount - 2), "em");

  assertRoot(str.tree.root);
});

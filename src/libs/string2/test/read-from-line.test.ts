import { String2 } from "../string2.ts";
import { assertGenerator, assertRoot } from "./helpers.ts";

Deno.test("Line at valid index", () => {
  const str = new String2("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(str.read2(0, 0), "Lorem\nipsum\ndolor\nsit\namet");
  assertGenerator(str.read2(1, 0), "ipsum\ndolor\nsit\namet");
  assertGenerator(str.read2(2, 0), "dolor\nsit\namet");
  assertGenerator(str.read2(3, 0), "sit\namet");
  assertGenerator(str.read2(4, 0), "amet");

  assertRoot(str.tree.root);
});

Deno.test("Line at index >= line_count", () => {
  const str = new String2("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(str.read2(4, 0), "amet");
  assertGenerator(str.read2(5, 0), "");
  assertGenerator(str.read2(6, 0), "");

  assertRoot(str.tree.root);
});

Deno.test("Line at index < 0", () => {
  const str = new String2("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(str.read2(0, 0), "Lorem\nipsum\ndolor\nsit\namet");
  assertGenerator(str.read2(str.lineCount - 1, 0), "amet");
  assertGenerator(str.read2(str.lineCount - 2, 0), "sit\namet");

  assertRoot(str.tree.root);
});

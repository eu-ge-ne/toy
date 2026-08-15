import { assertEquals } from "@std/assert";

import { String2 } from "../string2.ts";
import { assertGenerator, assertRoot } from "./helpers.ts";

Deno.test("Empty", () => {
  const str = new String2();

  assertEquals(str.lineCount, 0);
  assertGenerator(str.read2(0, 0, 1, 0), "");

  assertRoot(str.tree.root);
});

Deno.test("1 line", () => {
  const str = new String2("0");

  assertEquals(str.lineCount, 1);
  assertGenerator(str.read2(0, 0, 1, 0), "0");

  assertRoot(str.tree.root);
});

Deno.test("2 lines", () => {
  const str = new String2("0\n");

  assertEquals(str.lineCount, 2);
  assertGenerator(str.read2(0, 0, 1, 0), "0\n");
  assertGenerator(str.read2(1, 0, 2, 0), "");

  assertRoot(str.tree.root);
});

Deno.test("3 lines", () => {
  const str = new String2("0\n1\n");

  assertEquals(str.lineCount, 3);
  assertGenerator(str.read2(0, 0, 1, 0), "0\n");
  assertGenerator(str.read2(1, 0, 2, 0), "1\n");
  assertGenerator(str.read2(2, 0, 3, 0), "");

  assertRoot(str.tree.root);
});

Deno.test("Line at valid index", () => {
  const str = new String2();

  str.insert(0, "Lorem\naliqua.");
  str.insert(6, "ipsum\nmagna\n");
  str.insert(12, "dolor\ndolore\n");
  str.insert(18, "sit\net\n");
  str.insert(22, "amet,\nlabore\n");
  str.insert(28, "consectetur\nut\n");
  str.insert(40, "adipiscing\nincididunt\n");
  str.insert(51, "elit,\ntempor\n");
  str.insert(57, "sed\neiusmod\n");
  str.insert(61, "do\n");

  assertGenerator(str.read2(0, 0, 1, 0), "Lorem\n");
  assertGenerator(str.read2(1, 0, 2, 0), "ipsum\n");
  assertGenerator(str.read2(2, 0, 3, 0), "dolor\n");
  assertGenerator(str.read2(3, 0, 4, 0), "sit\n");
  assertGenerator(str.read2(4, 0, 5, 0), "amet,\n");
  assertGenerator(str.read2(5, 0, 6, 0), "consectetur\n");
  assertGenerator(str.read2(6, 0, 7, 0), "adipiscing\n");
  assertGenerator(str.read2(7, 0, 8, 0), "elit,\n");
  assertGenerator(str.read2(8, 0, 9, 0), "sed\n");
  assertGenerator(str.read2(9, 0, 10, 0), "do\n");
  assertGenerator(str.read2(10, 0, 11, 0), "eiusmod\n");
  assertGenerator(str.read2(11, 0, 12, 0), "tempor\n");
  assertGenerator(str.read2(12, 0, 13, 0), "incididunt\n");
  assertGenerator(str.read2(13, 0, 14, 0), "ut\n");
  assertGenerator(str.read2(14, 0, 15, 0), "labore\n");
  assertGenerator(str.read2(15, 0, 16, 0), "et\n");
  assertGenerator(str.read2(16, 0, 17, 0), "dolore\n");
  assertGenerator(str.read2(17, 0, 18, 0), "magna\n");
  assertGenerator(str.read2(18, 0, 19, 0), "aliqua.");

  assertRoot(str.tree.root);
});

Deno.test("Line at index >= line_count", () => {
  const str = new String2("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(str.read2(4, 0, 5, 0), "amet");
  assertGenerator(str.read2(5, 0, 6, 0), "");
  assertGenerator(str.read2(6, 0, 7, 0), "");

  assertRoot(str.tree.root);
});

Deno.test("Line at index < 0", () => {
  const str = new String2("Lorem\nipsum\ndolor\nsit\namet");

  assertGenerator(str.read2(0, 0, 1, 0), "Lorem\n");
  assertGenerator(
    str.read2(str.lineCount - 1, 0, str.lineCount, 0),
    "amet",
  );
  assertGenerator(
    str.read2(str.lineCount - 2, 0, str.lineCount - 1, 0),
    "sit\n",
  );

  assertRoot(str.tree.root);
});

Deno.test("Insert adds lines", () => {
  const str = new String2();

  for (let i = 0; i < 10; i += 1) {
    str.insert(str.charCount, `${i}\n`);

    assertEquals(str.lineCount, i + 2);
    assertGenerator(str.read2(i, 0, i + 1, 0), `${i}\n`);
    assertRoot(str.tree.root);
  }

  assertEquals(str.lineCount, 11);
  assertGenerator(str.read2(11, 0, 12, 0), "");
  assertRoot(str.tree.root);
});

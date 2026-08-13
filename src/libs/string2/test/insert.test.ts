import { assertEquals } from "@std/assert";

import { String2 } from "../string2.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Insert into the end", () => {
  const str = new String2();

  str.insert(str.charCount, "Lorem");
  assertGenerator(str.read(0), "Lorem");
  assertEquals(str.charCount, 5);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " ipsum");
  assertGenerator(str.read(0), "Lorem ipsum");
  assertEquals(str.charCount, 11);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " dolor");
  assertGenerator(str.read(0), "Lorem ipsum dolor");
  assertEquals(str.charCount, 17);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " sit");
  assertGenerator(str.read(0), "Lorem ipsum dolor sit");
  assertEquals(str.charCount, 21);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " amet,");
  assertGenerator(str.read(0), "Lorem ipsum dolor sit amet,");
  assertEquals(str.charCount, 27);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " consectetur");
  assertGenerator(str.read(0), "Lorem ipsum dolor sit amet, consectetur");
  assertEquals(str.charCount, 39);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " adipiscing");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing",
  );
  assertEquals(str.charCount, 50);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " elit,");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  );
  assertEquals(str.charCount, 56);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " sed");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed",
  );
  assertEquals(str.charCount, 60);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " do");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
  );
  assertEquals(str.charCount, 63);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " eiusmod");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
  );
  assertEquals(str.charCount, 71);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " tempor");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  );
  assertEquals(str.charCount, 78);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " incididunt");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  );
  assertEquals(str.charCount, 89);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " ut");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut",
  );
  assertEquals(str.charCount, 92);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " labore");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
  );
  assertEquals(str.charCount, 99);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " et");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
  );
  assertEquals(str.charCount, 102);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " dolore");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore",
  );
  assertEquals(str.charCount, 109);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " magna");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
  );
  assertEquals(str.charCount, 115);
  assertRoot(str.tree.root);

  str.insert(str.charCount, " aliqua.");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 123);
  assertRoot(str.tree.root);
});

Deno.test("Insert into the beginning", () => {
  const str = new String2();

  str.insert(0, " aliqua.");
  assertGenerator(str.read(0), " aliqua.");
  assertEquals(str.charCount, 8);
  assertRoot(str.tree.root);

  str.insert(0, " magna");
  assertGenerator(str.read(0), " magna aliqua.");
  assertEquals(str.charCount, 14);
  assertRoot(str.tree.root);

  str.insert(0, " dolore");
  assertGenerator(str.read(0), " dolore magna aliqua.");
  assertEquals(str.charCount, 21);
  assertRoot(str.tree.root);

  str.insert(0, " et");
  assertGenerator(str.read(0), " et dolore magna aliqua.");
  assertEquals(str.charCount, 24);
  assertRoot(str.tree.root);

  str.insert(0, " labore");
  assertGenerator(str.read(0), " labore et dolore magna aliqua.");
  assertEquals(str.charCount, 31);
  assertRoot(str.tree.root);

  str.insert(0, " ut");
  assertGenerator(str.read(0), " ut labore et dolore magna aliqua.");
  assertEquals(str.charCount, 34);
  assertRoot(str.tree.root);

  str.insert(0, " incididunt");
  assertGenerator(
    str.read(0),
    " incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 45);
  assertRoot(str.tree.root);

  str.insert(0, " tempor");
  assertGenerator(
    str.read(0),
    " tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 52);
  assertRoot(str.tree.root);

  str.insert(0, " eiusmod");
  assertGenerator(
    str.read(0),
    " eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 60);
  assertRoot(str.tree.root);

  str.insert(0, " do");
  assertGenerator(
    str.read(0),
    " do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 63);
  assertRoot(str.tree.root);

  str.insert(0, " sed");
  assertGenerator(
    str.read(0),
    " sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 67);
  assertRoot(str.tree.root);

  str.insert(0, " elit,");
  assertGenerator(
    str.read(0),
    " elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 73);
  assertRoot(str.tree.root);

  str.insert(0, " adipiscing");
  assertGenerator(
    str.read(0),
    " adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 84);
  assertRoot(str.tree.root);

  str.insert(0, " consectetur");
  assertGenerator(
    str.read(0),
    " consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 96);
  assertRoot(str.tree.root);

  str.insert(0, " amet,");
  assertGenerator(
    str.read(0),
    " amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 102);
  assertRoot(str.tree.root);

  str.insert(0, " sit");
  assertGenerator(
    str.read(0),
    " sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 106);
  assertRoot(str.tree.root);

  str.insert(0, " dolor");
  assertGenerator(
    str.read(0),
    " dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 112);
  assertRoot(str.tree.root);

  str.insert(0, " ipsum");
  assertGenerator(
    str.read(0),
    " ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 118);
  assertRoot(str.tree.root);

  str.insert(0, "Lorem");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 123);
  assertRoot(str.tree.root);
});

Deno.test("Insert splitting nodes", () => {
  const str = new String2();

  str.insert(0, "Lorem aliqua.");
  assertGenerator(str.read(0), "Lorem aliqua.");
  assertEquals(str.charCount, 13);
  assertRoot(str.tree.root);

  str.insert(5, " ipsum magna");
  assertGenerator(str.read(0), "Lorem ipsum magna aliqua.");
  assertEquals(str.charCount, 25);
  assertRoot(str.tree.root);

  str.insert(11, " dolor dolore");
  assertGenerator(str.read(0), "Lorem ipsum dolor dolore magna aliqua.");
  assertEquals(str.charCount, 38);
  assertRoot(str.tree.root);

  str.insert(17, " sit et");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 45);
  assertRoot(str.tree.root);

  str.insert(21, " amet, labore");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 58);
  assertRoot(str.tree.root);

  str.insert(27, " consectetur ut");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 73);
  assertRoot(str.tree.root);

  str.insert(39, " adipiscing incididunt");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 95);
  assertRoot(str.tree.root);

  str.insert(50, " elit, tempor");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 108);
  assertRoot(str.tree.root);

  str.insert(56, " sed eiusmod");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 120);
  assertRoot(str.tree.root);

  str.insert(60, " do");
  assertGenerator(
    str.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(str.charCount, 123);
  assertRoot(str.tree.root);
});

Deno.test("Insert at the negative index", () => {
  const str = new String2();

  str.insert(0, "ipsum");
  assertGenerator(str.read(0), "ipsum");
  assertEquals(str.charCount, 5);
  assertRoot(str.tree.root);

  str.insert(-5, " ");
  assertGenerator(str.read(0), " ipsum");
  assertEquals(str.charCount, 6);
  assertRoot(str.tree.root);

  str.insert(-6, "Lorem");
  assertGenerator(str.read(0), "Lorem ipsum");
  assertEquals(str.charCount, 11);
  assertRoot(str.tree.root);
});

Deno.test("Insert splitting node with fixup", () => {
  const str = new String2();

  str.insert(0, "11");
  str.insert(2, "22");

  str.insert(2, "3");
  str.insert(3, "3");

  str.insert(4, "4");
  str.insert(5, "4");

  assertGenerator(str.read(0), "11334422");

  str.insert(4, "-");

  assertGenerator(str.read(0), "1133-4422");
  assertRoot(str.tree.root);
});

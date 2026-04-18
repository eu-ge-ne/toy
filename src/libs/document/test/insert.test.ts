import { assertEquals } from "@std/assert";

import { Document } from "../document.ts";
import { assertGenerator, assertRoot } from "./assert.ts";

Deno.test("Insert into the end", () => {
  const doc = new Document();

  doc.insert(doc.charCount, "Lorem");
  assertGenerator(doc.read(0), "Lorem");
  assertEquals(doc.charCount, 5);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " ipsum");
  assertGenerator(doc.read(0), "Lorem ipsum");
  assertEquals(doc.charCount, 11);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " dolor");
  assertGenerator(doc.read(0), "Lorem ipsum dolor");
  assertEquals(doc.charCount, 17);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " sit");
  assertGenerator(doc.read(0), "Lorem ipsum dolor sit");
  assertEquals(doc.charCount, 21);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " amet,");
  assertGenerator(doc.read(0), "Lorem ipsum dolor sit amet,");
  assertEquals(doc.charCount, 27);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " consectetur");
  assertGenerator(doc.read(0), "Lorem ipsum dolor sit amet, consectetur");
  assertEquals(doc.charCount, 39);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " adipiscing");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing",
  );
  assertEquals(doc.charCount, 50);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " elit,");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  );
  assertEquals(doc.charCount, 56);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " sed");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed",
  );
  assertEquals(doc.charCount, 60);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " do");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
  );
  assertEquals(doc.charCount, 63);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " eiusmod");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
  );
  assertEquals(doc.charCount, 71);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " tempor");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  );
  assertEquals(doc.charCount, 78);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " incididunt");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  );
  assertEquals(doc.charCount, 89);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " ut");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut",
  );
  assertEquals(doc.charCount, 92);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " labore");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
  );
  assertEquals(doc.charCount, 99);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " et");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
  );
  assertEquals(doc.charCount, 102);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " dolore");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore",
  );
  assertEquals(doc.charCount, 109);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " magna");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
  );
  assertEquals(doc.charCount, 115);
  assertRoot(doc.tree.root);

  doc.insert(doc.charCount, " aliqua.");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 123);
  assertRoot(doc.tree.root);
});

Deno.test("Insert into the beginning", () => {
  const doc = new Document();

  doc.insert(0, " aliqua.");
  assertGenerator(doc.read(0), " aliqua.");
  assertEquals(doc.charCount, 8);
  assertRoot(doc.tree.root);

  doc.insert(0, " magna");
  assertGenerator(doc.read(0), " magna aliqua.");
  assertEquals(doc.charCount, 14);
  assertRoot(doc.tree.root);

  doc.insert(0, " dolore");
  assertGenerator(doc.read(0), " dolore magna aliqua.");
  assertEquals(doc.charCount, 21);
  assertRoot(doc.tree.root);

  doc.insert(0, " et");
  assertGenerator(doc.read(0), " et dolore magna aliqua.");
  assertEquals(doc.charCount, 24);
  assertRoot(doc.tree.root);

  doc.insert(0, " labore");
  assertGenerator(doc.read(0), " labore et dolore magna aliqua.");
  assertEquals(doc.charCount, 31);
  assertRoot(doc.tree.root);

  doc.insert(0, " ut");
  assertGenerator(doc.read(0), " ut labore et dolore magna aliqua.");
  assertEquals(doc.charCount, 34);
  assertRoot(doc.tree.root);

  doc.insert(0, " incididunt");
  assertGenerator(
    doc.read(0),
    " incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 45);
  assertRoot(doc.tree.root);

  doc.insert(0, " tempor");
  assertGenerator(
    doc.read(0),
    " tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 52);
  assertRoot(doc.tree.root);

  doc.insert(0, " eiusmod");
  assertGenerator(
    doc.read(0),
    " eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 60);
  assertRoot(doc.tree.root);

  doc.insert(0, " do");
  assertGenerator(
    doc.read(0),
    " do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 63);
  assertRoot(doc.tree.root);

  doc.insert(0, " sed");
  assertGenerator(
    doc.read(0),
    " sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 67);
  assertRoot(doc.tree.root);

  doc.insert(0, " elit,");
  assertGenerator(
    doc.read(0),
    " elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 73);
  assertRoot(doc.tree.root);

  doc.insert(0, " adipiscing");
  assertGenerator(
    doc.read(0),
    " adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 84);
  assertRoot(doc.tree.root);

  doc.insert(0, " consectetur");
  assertGenerator(
    doc.read(0),
    " consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 96);
  assertRoot(doc.tree.root);

  doc.insert(0, " amet,");
  assertGenerator(
    doc.read(0),
    " amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 102);
  assertRoot(doc.tree.root);

  doc.insert(0, " sit");
  assertGenerator(
    doc.read(0),
    " sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 106);
  assertRoot(doc.tree.root);

  doc.insert(0, " dolor");
  assertGenerator(
    doc.read(0),
    " dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 112);
  assertRoot(doc.tree.root);

  doc.insert(0, " ipsum");
  assertGenerator(
    doc.read(0),
    " ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 118);
  assertRoot(doc.tree.root);

  doc.insert(0, "Lorem");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 123);
  assertRoot(doc.tree.root);
});

Deno.test("Insert splitting nodes", () => {
  const doc = new Document();

  doc.insert(0, "Lorem aliqua.");
  assertGenerator(doc.read(0), "Lorem aliqua.");
  assertEquals(doc.charCount, 13);
  assertRoot(doc.tree.root);

  doc.insert(5, " ipsum magna");
  assertGenerator(doc.read(0), "Lorem ipsum magna aliqua.");
  assertEquals(doc.charCount, 25);
  assertRoot(doc.tree.root);

  doc.insert(11, " dolor dolore");
  assertGenerator(doc.read(0), "Lorem ipsum dolor dolore magna aliqua.");
  assertEquals(doc.charCount, 38);
  assertRoot(doc.tree.root);

  doc.insert(17, " sit et");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 45);
  assertRoot(doc.tree.root);

  doc.insert(21, " amet, labore");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 58);
  assertRoot(doc.tree.root);

  doc.insert(27, " consectetur ut");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 73);
  assertRoot(doc.tree.root);

  doc.insert(39, " adipiscing incididunt");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 95);
  assertRoot(doc.tree.root);

  doc.insert(50, " elit, tempor");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 108);
  assertRoot(doc.tree.root);

  doc.insert(56, " sed eiusmod");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 120);
  assertRoot(doc.tree.root);

  doc.insert(60, " do");
  assertGenerator(
    doc.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(doc.charCount, 123);
  assertRoot(doc.tree.root);
});

Deno.test("Insert at the negative index", () => {
  const doc = new Document();

  doc.insert(0, "ipsum");
  assertGenerator(doc.read(0), "ipsum");
  assertEquals(doc.charCount, 5);
  assertRoot(doc.tree.root);

  doc.insert(-5, " ");
  assertGenerator(doc.read(0), " ipsum");
  assertEquals(doc.charCount, 6);
  assertRoot(doc.tree.root);

  doc.insert(-6, "Lorem");
  assertGenerator(doc.read(0), "Lorem ipsum");
  assertEquals(doc.charCount, 11);
  assertRoot(doc.tree.root);
});

Deno.test("Insert splitting node with fixup", () => {
  const doc = new Document();

  doc.insert(0, "11");
  doc.insert(2, "22");

  doc.insert(2, "3");
  doc.insert(3, "3");

  doc.insert(4, "4");
  doc.insert(5, "4");

  assertGenerator(doc.read(0), "11334422");

  doc.insert(4, "-");

  assertGenerator(doc.read(0), "1133-4422");
  assertRoot(doc.tree.root);
});

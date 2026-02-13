import { assertEquals } from "@std/assert";

import { TextBuf } from "../text-buf.ts";
import { assert_generator, assert_root } from "./assert.ts";

Deno.test("Insert into the end", () => {
  const buf = new TextBuf();

  buf.insert(buf.charCount, "Lorem");
  assert_generator(buf.read(0), "Lorem");
  assertEquals(buf.charCount, 5);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " ipsum");
  assert_generator(buf.read(0), "Lorem ipsum");
  assertEquals(buf.charCount, 11);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " dolor");
  assert_generator(buf.read(0), "Lorem ipsum dolor");
  assertEquals(buf.charCount, 17);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " sit");
  assert_generator(buf.read(0), "Lorem ipsum dolor sit");
  assertEquals(buf.charCount, 21);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " amet,");
  assert_generator(buf.read(0), "Lorem ipsum dolor sit amet,");
  assertEquals(buf.charCount, 27);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " consectetur");
  assert_generator(buf.read(0), "Lorem ipsum dolor sit amet, consectetur");
  assertEquals(buf.charCount, 39);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " adipiscing");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing",
  );
  assertEquals(buf.charCount, 50);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " elit,");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  );
  assertEquals(buf.charCount, 56);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " sed");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed",
  );
  assertEquals(buf.charCount, 60);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " do");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
  );
  assertEquals(buf.charCount, 63);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " eiusmod");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
  );
  assertEquals(buf.charCount, 71);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " tempor");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  );
  assertEquals(buf.charCount, 78);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " incididunt");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  );
  assertEquals(buf.charCount, 89);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " ut");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut",
  );
  assertEquals(buf.charCount, 92);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " labore");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
  );
  assertEquals(buf.charCount, 99);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " et");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
  );
  assertEquals(buf.charCount, 102);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " dolore");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore",
  );
  assertEquals(buf.charCount, 109);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " magna");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
  );
  assertEquals(buf.charCount, 115);
  assert_root(buf.tree.root);

  buf.insert(buf.charCount, " aliqua.");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 123);
  assert_root(buf.tree.root);
});

Deno.test("Insert into the beginning", () => {
  const buf = new TextBuf();

  buf.insert(0, " aliqua.");
  assert_generator(buf.read(0), " aliqua.");
  assertEquals(buf.charCount, 8);
  assert_root(buf.tree.root);

  buf.insert(0, " magna");
  assert_generator(buf.read(0), " magna aliqua.");
  assertEquals(buf.charCount, 14);
  assert_root(buf.tree.root);

  buf.insert(0, " dolore");
  assert_generator(buf.read(0), " dolore magna aliqua.");
  assertEquals(buf.charCount, 21);
  assert_root(buf.tree.root);

  buf.insert(0, " et");
  assert_generator(buf.read(0), " et dolore magna aliqua.");
  assertEquals(buf.charCount, 24);
  assert_root(buf.tree.root);

  buf.insert(0, " labore");
  assert_generator(buf.read(0), " labore et dolore magna aliqua.");
  assertEquals(buf.charCount, 31);
  assert_root(buf.tree.root);

  buf.insert(0, " ut");
  assert_generator(buf.read(0), " ut labore et dolore magna aliqua.");
  assertEquals(buf.charCount, 34);
  assert_root(buf.tree.root);

  buf.insert(0, " incididunt");
  assert_generator(
    buf.read(0),
    " incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 45);
  assert_root(buf.tree.root);

  buf.insert(0, " tempor");
  assert_generator(
    buf.read(0),
    " tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 52);
  assert_root(buf.tree.root);

  buf.insert(0, " eiusmod");
  assert_generator(
    buf.read(0),
    " eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 60);
  assert_root(buf.tree.root);

  buf.insert(0, " do");
  assert_generator(
    buf.read(0),
    " do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 63);
  assert_root(buf.tree.root);

  buf.insert(0, " sed");
  assert_generator(
    buf.read(0),
    " sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 67);
  assert_root(buf.tree.root);

  buf.insert(0, " elit,");
  assert_generator(
    buf.read(0),
    " elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 73);
  assert_root(buf.tree.root);

  buf.insert(0, " adipiscing");
  assert_generator(
    buf.read(0),
    " adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 84);
  assert_root(buf.tree.root);

  buf.insert(0, " consectetur");
  assert_generator(
    buf.read(0),
    " consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 96);
  assert_root(buf.tree.root);

  buf.insert(0, " amet,");
  assert_generator(
    buf.read(0),
    " amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 102);
  assert_root(buf.tree.root);

  buf.insert(0, " sit");
  assert_generator(
    buf.read(0),
    " sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 106);
  assert_root(buf.tree.root);

  buf.insert(0, " dolor");
  assert_generator(
    buf.read(0),
    " dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 112);
  assert_root(buf.tree.root);

  buf.insert(0, " ipsum");
  assert_generator(
    buf.read(0),
    " ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 118);
  assert_root(buf.tree.root);

  buf.insert(0, "Lorem");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 123);
  assert_root(buf.tree.root);
});

Deno.test("Insert splitting nodes", () => {
  const buf = new TextBuf();

  buf.insert(0, "Lorem aliqua.");
  assert_generator(buf.read(0), "Lorem aliqua.");
  assertEquals(buf.charCount, 13);
  assert_root(buf.tree.root);

  buf.insert(5, " ipsum magna");
  assert_generator(buf.read(0), "Lorem ipsum magna aliqua.");
  assertEquals(buf.charCount, 25);
  assert_root(buf.tree.root);

  buf.insert(11, " dolor dolore");
  assert_generator(buf.read(0), "Lorem ipsum dolor dolore magna aliqua.");
  assertEquals(buf.charCount, 38);
  assert_root(buf.tree.root);

  buf.insert(17, " sit et");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 45);
  assert_root(buf.tree.root);

  buf.insert(21, " amet, labore");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 58);
  assert_root(buf.tree.root);

  buf.insert(27, " consectetur ut");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 73);
  assert_root(buf.tree.root);

  buf.insert(39, " adipiscing incididunt");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 95);
  assert_root(buf.tree.root);

  buf.insert(50, " elit, tempor");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 108);
  assert_root(buf.tree.root);

  buf.insert(56, " sed eiusmod");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 120);
  assert_root(buf.tree.root);

  buf.insert(60, " do");
  assert_generator(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.charCount, 123);
  assert_root(buf.tree.root);
});

Deno.test("Insert at the negative index", () => {
  const buf = new TextBuf();

  buf.insert(0, "ipsum");
  assert_generator(buf.read(0), "ipsum");
  assertEquals(buf.charCount, 5);
  assert_root(buf.tree.root);

  buf.insert(-5, " ");
  assert_generator(buf.read(0), " ipsum");
  assertEquals(buf.charCount, 6);
  assert_root(buf.tree.root);

  buf.insert(-6, "Lorem");
  assert_generator(buf.read(0), "Lorem ipsum");
  assertEquals(buf.charCount, 11);
  assert_root(buf.tree.root);
});

Deno.test("Insert splitting node with fixup", () => {
  const buf = new TextBuf();

  buf.insert(0, "11");
  buf.insert(2, "22");

  buf.insert(2, "3");
  buf.insert(3, "3");

  buf.insert(4, "4");
  buf.insert(5, "4");

  assert_generator(buf.read(0), "11334422");

  buf.insert(4, "-");

  assert_generator(buf.read(0), "1133-4422");
  assert_root(buf.tree.root);
});

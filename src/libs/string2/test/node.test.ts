import { assertEquals } from "@std/assert";

import { Buf } from "../buf.ts";
import { Node } from "../node.ts";

Deno.test("Create", () => {
  const buf = new Buf("hello");

  const node = Node.create(buf, 1, 2);

  assertEquals(node.start, 1);
  assertEquals(node.end, 2);
  assertEquals(node.eolStart, 0);
  assertEquals(node.eolEnd, 0);
});

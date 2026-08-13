import { assertEquals } from "@std/assert";

import { Buf } from "../buf.ts";
import { Slice } from "../slice.ts";

Deno.test("Read", () => {
  const buf = new Buf("hello");

  const slice = Slice.create(buf, 1, 2);

  assertEquals(slice.start, 1);
  assertEquals(slice.end, 2);
  assertEquals(slice.eolStart, 0);
  assertEquals(slice.eolEnd, 0);
});

import { assertEquals } from "@std/assert";

import { Document } from "../document.ts";

Deno.test("0 newlines", () => {
  const doc1 = new Document("A");
  const doc2 = new Document("😄");
  const doc3 = new Document("🤦🏼‍♂️");

  assertEquals(doc1.lineCount, 1);
  assertEquals(doc2.lineCount, 1);
  assertEquals(doc3.lineCount, 1);
});

Deno.test("LF", () => {
  const doc1 = new Document("A\nA");
  const doc2 = new Document("😄\n😄");
  const doc3 = new Document("🤦🏼‍♂️\n🤦🏼‍♂️");

  assertEquals(doc1.lineCount, 2);
  assertEquals(doc2.lineCount, 2);
  assertEquals(doc3.lineCount, 2);
});

Deno.test("CRLF", () => {
  const doc1 = new Document("A\r\nA");
  const doc2 = new Document("😄\r\n😄");
  const doc3 = new Document("🤦🏼‍♂️\r\n🤦🏼‍♂️");

  assertEquals(doc1.lineCount, 2);
  assertEquals(doc2.lineCount, 2);
  assertEquals(doc3.lineCount, 2);
});

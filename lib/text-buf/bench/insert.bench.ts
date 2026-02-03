import { TextBuf } from "../text-buf.ts";

import { str } from "./utils.ts";

const N = 10 ** 5;

Deno.bench("Appending into a TextBuf", {
  group: "Append",
  baseline: true,
}, (b) => {
  const buf = new TextBuf();

  b.start();

  for (let i = 0; i < N; i += 1) {
    buf.insert(buf.count, str(1));
  }

  b.end();
});

Deno.bench("Appending into a string", {
  group: "Append",
}, (b) => {
  let buf = "";

  b.start();

  for (let i = 0; i < N; i += 1) {
    buf += str(1);
  }

  b.end();
});

Deno.bench("Inserting into a TextBuf", {
  group: "Insert",
  baseline: true,
}, (b) => {
  const buf = new TextBuf(str(2));

  b.start();

  for (let i = 0; i < N; i += 1) {
    const pos = Math.trunc(buf.count / 2);
    buf.insert(pos, str(2));
  }

  b.end();
});

Deno.bench("Inserting into a string", {
  group: "Insert",
}, (b) => {
  let buf = str(2);

  b.start();

  for (let i = 0; i < N; i += 1) {
    const pos = Math.trunc(buf.length / 2);
    buf = buf.slice(0, pos) + str(2) + buf.slice(pos);
  }

  b.end();
});

import { TextBuf } from "../text-buf.ts";

import { str } from "./utils.ts";

const N = 10 ** 5;

Deno.bench("Trimming a TextBuf", {
  group: "Trim",
  baseline: true,
}, (b) => {
  const buf = new TextBuf(str(N));

  b.start();

  for (let i = 0; i < N; i += 1) {
    buf.delete(-1, 1);
  }

  b.end();
});

Deno.bench("Trimming a string", {
  group: "Trim",
}, (b) => {
  let buf = str(N);

  b.start();

  for (let i = 0; i < N; i += 1) {
    buf = buf.slice(0, -1);
  }

  b.end();
});

Deno.bench("Deleting from a TextBuf", {
  group: "Delete",
  baseline: true,
}, (b) => {
  const buf = new TextBuf(str(N));

  b.start();

  for (let i = 0; i < N; i += 1) {
    const pos = Math.trunc(buf.count / 2);
    buf.delete(pos, 1);
  }

  b.end();
});

Deno.bench("Deleting from a string", {
  group: "Delete",
}, (b) => {
  let buf = str(N);

  b.start();

  for (let i = 0; i < N; i += 1) {
    const pos = Math.trunc(buf.length / 2);
    buf = buf.slice(0, pos) + buf.slice(pos + 1);
  }

  b.end();
});

import { TextBuf } from "../text-buf.ts";

import { lines, read_line } from "./utils.ts";

const N = 10 ** 3;

Deno.bench("Accessing a line in a TextBuf", {
  group: "Line",
  baseline: true,
}, (b) => {
  const buf = new TextBuf(lines(N));

  b.start();

  for (let i = 0; i < N; i += 1) {
    const _ = buf.read(i, i + 1).toArray();
  }

  b.end();
});

Deno.bench("Accessing a line in a string", {
  group: "Line",
}, (b) => {
  const buf = lines(N);

  b.start();

  for (let i = 0; i < N; i += 1) {
    const _ = read_line(buf, i);
  }

  b.end();
});

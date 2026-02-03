import { TextBuf } from "../text-buf.ts";

import { str } from "./utils.ts";

const N = 10 ** 6;

Deno.bench("Creating a TextBuf", {
  group: "Create",
  baseline: true,
}, () => {
  const _ = new TextBuf(str(N));
});

Deno.bench("Creating a string", {
  group: "Create",
}, () => {
  const _ = str(N);
});

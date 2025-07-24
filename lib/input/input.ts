export type { Key } from "@eu-ge-ne/kitty-keys";

import { Key, parse_keys } from "@eu-ge-ne/kitty-keys";

export async function* read_input(): AsyncGenerator<Key | string | Uint8Array> {
  const buf = new Uint8Array(1024);

  const len = await Deno.stdin.read(buf);

  if (len) {
    yield* parse_keys(buf.subarray(0, len));
  }
}

export type { Key } from "@eu-ge-ne/kitty-keys";

import { Key, parse_keys } from "@eu-ge-ne/kitty-keys";

export async function* read_input(): AsyncGenerator<Key | string | Uint8Array> {
  const bytes = new Uint8Array(1024);

  const n = await Deno.stdin.read(bytes);
  if (n === null) {
    return;
  }

  if (n > 0) {
    yield* parse_keys(bytes.subarray(0, n));
  }
}

export type { Key } from "@eu-ge-ne/kitty-keys";

import { Key, parse_keys } from "@eu-ge-ne/kitty-keys";

export async function* read_input(): AsyncGenerator<Key | string | Uint8Array> {
  for await (const bytes of Deno.stdin.readable) {
    yield* parse_keys(bytes);
  }
}

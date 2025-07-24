export type { Key } from "@eu-ge-ne/kitty-keys";

import { Key, parse_keys } from "@eu-ge-ne/kitty-keys";

// TODO: improve
export async function* read_input(): AsyncGenerator<Key | string | Uint8Array> {
  const buf = new Uint8Array(1024);

  while (true) {
    const len = await Deno.stdin.read(buf);
    if (len === null) {
      break;
    }

    yield* parse_keys(buf.subarray(0, len));
  }
}

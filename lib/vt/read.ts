export type { KittyKey } from "@eu-ge-ne/kitty-keys";

import { KittyKey, parse_key } from "@eu-ge-ne/kitty-keys";

export async function* read(): AsyncGenerator<KittyKey | string | Uint8Array> {
  const buf = new Uint8Array(1024);

  const bytes_read = await Deno.stdin.read(buf);
  if (bytes_read === null) {
    return;
  }
  const bytes = buf.subarray(0, bytes_read);

  for (let i = 0; i < bytes.length;) {
    const [key, n] = parse_key(bytes.subarray(i));

    if (typeof key !== "undefined") {
      yield key;

      i += n;
    } else {
      let next_esc_i = bytes.indexOf(0x1b, i + 1);
      if (next_esc_i < 0) {
        next_esc_i = bytes.length;
      }

      yield bytes.subarray(i, next_esc_i);

      i = next_esc_i;
    }
  }
}

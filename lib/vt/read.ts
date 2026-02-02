import { Key } from "@lib/kitty";

export async function* read(): AsyncGenerator<Key | Uint8Array> {
  const buf = new Uint8Array(1024);

  const bytes_read = await Deno.stdin.read(buf);
  if (bytes_read === null) {
    return;
  }
  const bytes = buf.subarray(0, bytes_read);

  for (let i = 0; i < bytes.length;) {
    const result = Key.parse(bytes.subarray(i));

    if (!result) {
      let next_esc_i = bytes.indexOf(0x1b, i + 1);
      if (next_esc_i < 0) {
        next_esc_i = bytes.length;
      }

      yield bytes.subarray(i, next_esc_i);

      i = next_esc_i;

      continue;
    }

    yield result[0];

    i += result[1];
  }
}

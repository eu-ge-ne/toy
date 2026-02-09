import { Key } from "@lib/kitty";

const buf = new Uint8Array(1024);
let i = 0;
const waiters: PromiseWithResolvers<void>[] = [];

export async function listen(): Promise<void> {
  for await (const chunk of Deno.stdin.readable) {
    buf.set(chunk, i);
    i += chunk.byteLength;

    if (waiters.length !== 0) {
      for (const waiter of waiters) {
        waiter.resolve();
      }
      waiters.length = 0;
    }
  }
}

export async function readKey(): Promise<Key> {
  while (true) {
    const data = buf.subarray(0, i);

    const parsed = Key.parse(data);
    if (parsed) {
      const chunk = data.subarray(parsed[1]);

      buf.set(chunk);
      i = chunk.byteLength;

      return parsed[0];
    }

    const waiter = Promise.withResolvers<void>();
    waiters.push(waiter);
    await waiter.promise;
  }
}

export async function* __read(): AsyncGenerator<Key | Uint8Array> {
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

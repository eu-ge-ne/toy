export type { Key } from "@eu-ge-ne/kitty-keys";

import { Key, parse_keys } from "@eu-ge-ne/kitty-keys";

export type InputReader = ReadableStreamDefaultReader<Uint8Array>;

type Handler = (_: Key | string) => Promise<void>;

export function new_input_reader(on_key: Handler): InputReader {
  const reader = Deno.stdin.readable.getReader();

  run(reader, on_key);

  return reader;
}

async function run(reader: InputReader, on_key: Handler): Promise<void> {
  while (true) {
    const bytes = await read_bytes(reader);
    if (!bytes) {
      break;
    }

    for (const key of parse_keys(bytes)) {
      on_key(key);
    }
  }
}

async function read_bytes(
  reader: InputReader,
): Promise<Uint8Array | undefined> {
  try {
    const { value } = await reader.read();

    if (value) {
      return value;
    }

    // deno-lint-ignore no-empty
  } catch (_) {
  }
}

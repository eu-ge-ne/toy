export async function* load(fileName: string): AsyncGenerator<string> {
  using file = await Deno.open(fileName, { read: true });

  const info = await file.stat();
  if (!info.isFile) {
    throw new Error(`${fileName} is not a file`);
  }

  const bytes = new Uint8Array(1024 ** 2 * 64);
  const decoder = new TextDecoder();

  while (true) {
    const n = await file.read(bytes);
    if (typeof n !== "number") {
      break;
    }

    if (n > 0) {
      const text = decoder.decode(bytes.subarray(0, n), { stream: true });
      yield text;
    }
  }

  const text = decoder.decode();
  if (text.length > 0) {
    yield text;
  }
}

export async function save(
  fileName: string,
  text: Iterable<string>,
): Promise<void> {
  using file = await Deno.open(fileName, {
    create: true,
    write: true,
    truncate: true,
  });

  const encoder = new TextEncoderStream();
  const writer = encoder.writable.getWriter();

  encoder.readable.pipeTo(file.writable);

  for (const t of text) {
    await writer.write(t);
  }
}

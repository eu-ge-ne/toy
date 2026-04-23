const decoder = new TextDecoder();

export async function* loadFile(fileName: string): AsyncGenerator<string> {
  using file = await Deno.open(fileName, { read: true });

  const info = await file.stat();
  if (!info.isFile) {
    throw new Error(`${fileName} is not a file`);
  }

  const bytes = new Uint8Array(1024 ** 2 * 64);

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

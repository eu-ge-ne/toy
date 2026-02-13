import { SegBuf } from "@lib/seg-buf";

export async function load(buffer: SegBuf, file_path: string): Promise<void> {
  using file = await Deno.open(file_path, { read: true });

  const info = await file.stat();
  if (!info.isFile) {
    throw new Error(`${file_path} is not a file`);
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
      buffer.buf.append(text);
    }
  }

  const text = decoder.decode();
  if (text.length > 0) {
    buffer.buf.append(text);
  }
}

export async function save(buffer: SegBuf, file_path: string): Promise<void> {
  using file = await Deno.open(file_path, {
    create: true,
    write: true,
    truncate: true,
  });

  const encoder = new TextEncoderStream();
  const writer = encoder.writable.getWriter();

  encoder.readable.pipeTo(file.writable);

  for (const text of buffer.buf.read(0)) {
    await writer.write(text);
  }
}

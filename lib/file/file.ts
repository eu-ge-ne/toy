import { TextBuf } from "@eu-ge-ne/text-buf";

export async function load(
  file_path: string,
  text_buf: TextBuf,
): Promise<void> {
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
      text_buf.append(text);
    }
  }

  const text = decoder.decode();
  if (text.length > 0) {
    text_buf.append(text);
  }
}

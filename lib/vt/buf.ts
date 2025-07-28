import { write } from "./write.ts";

const buf = new ArrayBuffer(1024 * 64, { maxByteLength: 1024 * 1024 * 64 });
const bytes = new Uint8Array(buf);

let i = 0;

export function write_buf(...chunks: Uint8Array[]): void {
  for (const chunk of chunks) {
    const j = i + chunk.byteLength;
    if (j > buf.byteLength) {
      buf.resize(j * 2);
    }

    bytes.set(chunk, i);
    i = j;
  }
}

export function flush_buf(...chunks: Uint8Array[]): void {
  write(bytes.subarray(0, i), ...chunks);

  i = 0;
}

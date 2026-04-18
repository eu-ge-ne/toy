import { Writer } from "./writer.ts";

const encoder = new TextEncoder();

const cache: Record<number, Uint8Array> = {};

export function writeSpaces(out: Writer, n: number): void {
  let bytes = cache[n];

  if (!bytes) {
    bytes = cache[n] = encoder.encode(` \x1b[${n - 1}b`);
  }

  out.write(bytes);
}

export function writeText(out: Writer, span: [number], text: string): void {
  if (text.length > span[0]) {
    text = text.slice(0, span[0]);
  }

  out.write(encoder.encode(text));

  span[0] -= text.length;
}

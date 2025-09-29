import { Writer } from "./writer.ts";

const encoder = new TextEncoder();

const cache: Record<number, Uint8Array> = {};

export function write_spaces(out: Writer, n: number): void {
  let bytes = cache[n];

  if (!bytes) {
    bytes = cache[n] = encoder.encode(` \x1b[${n - 1}b`);
  }

  out.write(bytes);
}

export function write_text(out: Writer, span: [number], text: string): void {
  if (text.length > span[0]) {
    text = text.slice(0, span[0]);
  }

  out.write(encoder.encode(text));

  span[0] -= text.length;
}

export function write_text_center(
  out: Writer,
  span: [number],
  text: string,
): void {
  if (text.length > span[0]) {
    text = text.slice(0, span[0]);
  }

  const ab = span[0] - text.length;
  const a = Math.trunc(ab / 2);

  write_spaces(out, a);
  out.write(encoder.encode(text));

  span[0] -= a + text.length;
}

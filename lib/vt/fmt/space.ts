import { Span } from "./span.ts";

let bytes = new Uint8Array(1024).fill(0x20);

export function space(len: number): Uint8Array {
  if (len < bytes.length) {
    return bytes.subarray(0, len);
  }

  bytes = new Uint8Array(len).fill(0x20);

  return bytes;
}

export function fill_space(span: Span, len: number): Uint8Array {
  if (len > span.len) {
    throw new Error("len > span.len");
  }

  span.len -= len;

  return space(len);
}

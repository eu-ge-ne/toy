const encoder = new TextEncoder();

export function text(text: string): Uint8Array {
  return encoder.encode(text);
}

const encoder = new TextEncoder();

export function csi(code: string): Uint8Array {
  return encoder.encode(`\x1b[${code}`);
}
